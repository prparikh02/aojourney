from aws_cdk import (
    core,
    aws_apigateway as apigateway,
    aws_certificatemanager as acm,
    aws_cloudfront as cf,
    aws_cognito as cognito,
    aws_lambda as lambda_,
    aws_s3 as s3,
    aws_s3_deployment as s3_deploy,
    aws_sqs as sqs,
    aws_iam as iam,
)


class AOJourneyStack(core.Stack):

    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Define Cognito User Pool for user sign up and sign in
        api_user_pool = cognito.UserPool(
            self,
            'aojourney-user-pool',
            user_pool_name='aojourney-user-pool',
            self_sign_up_enabled=True,
            user_verification=cognito.UserVerificationConfig(
                email_subject='Verify your email for our AOJourney!',
                email_body=(
                    'Hello {username}, Thanks for signing up for AOJourney! '
                    'Your verification code is {####}.'
                ),
                email_style=cognito.VerificationEmailStyle.CODE,
                sms_message=(
                    'Hello {username}, Thanks for signing up for AOJourney! '
                    'Your verification code is {####}.'
                ),
            ),
            sign_in_aliases=cognito.SignInAliases(
                email=True,
            ),
            mfa=cognito.Mfa.OPTIONAL,
            mfa_second_factor=cognito.MfaSecondFactor(
                otp=True,
                sms=True,
            ),
            password_policy=cognito.PasswordPolicy(
                min_length=12,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=True,
                temp_password_validity=core.Duration.hours(24),
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
        )
        app_client = api_user_pool.add_client(
            'aojourney-general-app-client',
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True,
                refresh_token=True,
                custom=True,
            )
        )
        app_client_id = app_client.user_pool_client_id

        # Define backend Lambda function to handle SQS queue messages
        # originating from API Gateway.
        backend = lambda_.Function(
            self,
            'aojourney-api-backend-fn',
            runtime=lambda_.Runtime.PYTHON_3_8,
            handler='aojourney-api-backend.handler',
            code=lambda_.Code.from_asset('../lambdas'),
        )

        # Define API Gateway, the entry-point for AOJourney
        api = apigateway.LambdaRestApi(
            self,
            'aojourney-api',
            handler=backend,
            rest_api_name='AOJourney',
            proxy=False,
            # TODO: This is dangerous. Allow in Beta, but not elsewhere.
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_headers=apigateway.Cors.DEFAULT_HEADERS,
                allow_methods=apigateway.Cors.ALL_METHODS,
                allow_origins=[
                    'http://localhost:3000',
                ]
            ),
        )

        # Define Cognito authorizers for API Gateway
        cognito_user_pool_authorizer = apigateway.CfnAuthorizer(
            id='aojourney_cognito_user_pool_api_authorizer',
            rest_api_id=api.rest_api_id,
            name='aojourney_cognito_user_pool_api_authorizer',
            scope=self,
            type='COGNITO_USER_POOLS',
            identity_source='method.request.header.Authorization',
            provider_arns=[api_user_pool.user_pool_arn],
        )
        # Not sure why we need to do this, but we do?
        def set_authorizer(method, authorizer):
            method.node.find_child('Resource').add_property_override(
                'AuthorizerId', authorizer.ref
            )

        # Define API Gateway resources

        # Endpoint: /entries
        entries = api.root.add_resource('entries')
        # To list all entries for the user
        get_entries_method = entries.add_method(
            'GET',
            authorization_type=apigateway.AuthorizationType.COGNITO,
        )
        set_authorizer(get_entries_method, cognito_user_pool_authorizer)

        # To add an entry for the user
        create_entry_method = entries.add_method(
            'POST',
            authorization_type=apigateway.AuthorizationType.COGNITO,
        )
        set_authorizer(create_entry_method, cognito_user_pool_authorizer)

        # Define S3 bucket and location for serving React App
        website_bucket = s3.Bucket(
            self,
            'aojourney-react-app-bucket',
            website_index_document='index.html',
            public_read_access=True,
        )
        # Deny non-SSL traffic
        website_bucket.add_to_resource_policy(iam.PolicyStatement(
            effect=iam.Effect.DENY,
            actions=["s3:*"],
            resources=[website_bucket.bucket_arn],
            conditions={
                'Bool': {
                    'aws:SecureTransport': False,
                }
            },
            principals=[iam.AnyPrincipal()],
        ))
        s3_deploy.BucketDeployment(
            self,
            'deploy-website',
            sources=[s3_deploy.Source.asset('../ao-journey-app/build')],
            destination_bucket=website_bucket,
        )

        # Define certificate for subdomain journal.parthrparikh.com
        cert = acm.Certificate(
            self,
            'parthrparikh-com-cert',
            domain_name='journal.parthrparikh.com',
        )

        # Define Cloudfront distribution
        cf_distro = cf.CloudFrontWebDistribution(
            self,
            'aojourney-distribution',
            origin_configs=[
                cf.SourceConfiguration(
                    s3_origin_source=cf.S3OriginConfig(
                        s3_bucket_source=website_bucket,
                    ),
                    behaviors=[
                        cf.Behavior(
                            is_default_behavior=True,
                            default_ttl=core.Duration.minutes(10),
                            max_ttl=core.Duration.hours(1),
                        )
                    ],
                ),
                cf.SourceConfiguration(
                    custom_origin_source=cf.CustomOriginConfig(
                        domain_name='4hxrvi5ze1.execute-api.us-east-1.amazonaws.com',  # API Gateway
                        origin_protocol_policy=cf.OriginProtocolPolicy.HTTPS_ONLY,
                    ),
                    behaviors=[
                        cf.Behavior(
                            path_pattern='/prod/entries',
                            allowed_methods=cf.CloudFrontAllowedMethods.ALL,
                            forwarded_values=cf.CfnDistribution.ForwardedValuesProperty(
                                query_string=False,
                                headers=[
                                    'Authorization',
                                    'Content-Type',
                                    'Accept',
                                    'Accept-Encoding',
                                ],
                                cookies=cf.CfnDistribution.CookiesProperty(
                                    forward='whitelist',
                                    whitelisted_names=[
                                        'cognito-auth',
                                    ]
                                )
                            )
                        )
                    ]
                ),
            ],
            viewer_certificate=cf.ViewerCertificate.from_acm_certificate(
                certificate=cert,
                aliases=[
                    'journal.parthrparikh.com',
                ]
            ),
            viewer_protocol_policy=cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        )

        # TODO: Define DynamoDB

        # TODO: Define CloudWatch
