# Project Steps

Started: 2020.08.02

## Steps

### CDK Set up

- Give my own user ownership of the npm config
  - `sudo chown -R $USER:$(id -gn $USER) /home/parth/.config`
- Updated NPM
  - `npm install -g npm@next`
- Update Node
  - `npm cache clean -f`
  - `npm install -g n`
- Install AWS CDK
  - `npm install -g aws-cdk`
- Install Python3.8 alongside system versions of Python (2.7 and 3.6)
  - Followed article: https://hackersandslackers.com/multiple-versions-python-ubuntu/
  - Learned: How to install and maintain *alternatives* of a software on Ubuntu. In this case, Python3.
    - `update-alternatives` is awesome!
  - Caveat: This only kind of worked. It allows me to do it at the root (system level), but not user :/
- Follow CDK setup instructions
  - https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-python.html
  - Initialize CDK, delete the Python version they used, and re-install the venv with Python3.8
    - `cdk init app --language python`
    - `rm -r .env/`
    - `python3.8 -m venv venv`
    - `source venv/bin/activate && which python3.8`

### IAM User

- Created IAM User `aojourney-cdk-user`
  - Needed a bunch of create permissions for CDK resource creation

### CDK

- Primarily used [CDK Documentation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html) to define some resources
- Try out some `cdk diff` and `cdk deploy`
  - Had to do a `cdk bootstrap aws://156522910806/us-east-1` to create asset buckets

### Cognito

- Use [API reference](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-api-reference.html) for CURL
  - APIs used: SignUp, ConfirmSignUp, InitiateAuth
  - Example using SignUp:

    ```bash
    curl -X POST --data @signup.json \
    -H 'X-Amz-Target: AWSCognitoIdentityProviderService.SignUp' \
    -H 'Content-Type: application/x-amz-json-1.1' \
    https://cognito-idp.us-east-1.amazonaws.com/
    ```

    ```json
    {
    "Username" : "something",
    "Password" : "something",
    "ClientId" : "something"
    }
    ```

### API Gateway

- CURL after InitiateAuth with Cognito to obtain auth (id) token:

  ```bash
  curl -X GET 'https://<API_GATEWAY_ENDPOINT>/prod/entries' \
  -H 'Authorization: <ACCESS_TOKEN>'
  ```

### React App

- Setup a React App; Follow [tutorial](https://github.com/facebook/create-react-app)
  - `npx create-react-app ao-journey-app`
- An interesting take on React server-side rendering (if necessary)
  - https://sbstjn.com/serverless-create-react-app-server-side-rendering-ssr-lamda.html
- Why you can't just load up the `build/index.html` and expect things to work:
  - [StackOverflow](https://stackoverflow.com/questions/39791069/create-react-app-npm-run-build-command)

Good Reads:
- https://serverless-stack.com/

### Security

- Spending a lot of time trying to figure out how to keep a user signed in with this statically-served React App.
  - This [article on ACG](https://read.acloud.guru/six-months-of-serverless-lessons-learned-f6da86a73526) sums up and nearly answers all my questions. Wish I had found it sooner.
- Good reads:
  - https://github.com/aws-amplify/amplify-js/issues/3436
  - https://medium.com/@jcbaey/authentication-in-spa-reactjs-and-vuejs-the-right-way-e4a9ac5cd9a3
    - This is the one. This is it.
  - https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81
  - https://auth0.com/docs/tokens/concepts/token-storage

### Cloudfront

- We're gonna use CloudFront to avoid having to allow CORS between API Gateway and S3
  - The CF distribution will front both origins - S3 for static website and API Gateway for APIs
- We'll use `CloudFrontWebDistribution` in CDK instead of `Distribution` because the latter does not yet have robust support for advanced features like multiple origins, viewer protocol policies, etc.
- Very useful article on HTTPS: [using-https](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https.html)
  - Despite [using-https-cloudfront-to-s3-origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-https-cloudfront-to-s3-origin.html), I don't think you can use HTTPS between Cloudfront and S3. At least you cannot via the CDK.
- Does using Cloudfront for the purpose of having the API and static website under the same domain even make sense?
  - I hardly plan on caching the API layer
  - Some comforting validation on [serverfault](https://serverfault.com/questions/918030/should-i-use-cloudfront-in-front-of-api-web-just-because-i-want-them-on-a-single).
