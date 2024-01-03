const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-southeast-1" });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let voteCount = {};
  const { postId } = event.arguments;
  if (!postId) {
    return {
      statusCode: 500,
      body: "Error",
    };
  }
  const voteTableName = process.env.API_VOTEAPP_VOTETABLE_NAME;

  const params = {
    TableName: voteTableName,
    FilterExpression: "#postId = :postId",
    ExpressionAttributeNames: {
      "#postId": "postId",
    },
    ExpressionAttributeValues: {
      ":postId": postId,
    },
  };

  const onScan = () => {
    return new Promise((resolve, reject) => {
      const handleScan = (err, data) => {
        if (err) {
          console.error(
            "Unable to scan the table. Error JSON:",
            JSON.stringify(err, null, 2)
          );
          reject(err);
        } else {
          data.Items.forEach(function (item) {
            if (voteCount[item.vote]) {
              voteCount[item.vote]++;
            } else {
              voteCount[item.vote] = 1;
            }
          });

          if (typeof data.LastEvaluatedKey != "undefined") {
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, handleScan);
          } else {
            resolve(voteCount);
          }
        }
      };

      docClient.scan(params, handleScan);
    });
  };

  const result = await onScan();
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
