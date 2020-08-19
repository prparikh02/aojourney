import boto3
import json
import uuid


s3_client = boto3.client('s3')


def handler(event, context):
    print('request: {}'.format(json.dumps(event)))
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'body': (
            'Hello, CDK! You have hit {}. '
            'Here\'s a random UUID: {}\n'.format(
                event['path'], uuid.uuid4()
            )
        )
    }
