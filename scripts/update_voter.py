

import uuid
import boto3

voter_table = ''
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(voter_table)

print("Success connect table ", table)

data = [
    # HERE AVAILABLE VOTER EMAILS
]

json_list = []

for email in data:
    generated_id = str(uuid.uuid4())
    res = {
        "id": generated_id,
        "postId": "video",
        "email": email,
    }

    response = table.put_item(Item=res)
    print("PutItem succeeded:", response)
