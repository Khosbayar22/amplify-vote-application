const { v4: uuidv4 } = require("uuid");

const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-southeast-1" });
const ddb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  console.log("EVENT: ", event);
  let userEmail;
  const { userId, postId, vote } = event.arguments;
  const { sub } = event.identity.claims;
  const voteTableName = process.env.API_VOTEAPP_VOTETABLE_NAME;
  const candidateTableName = process.env.API_VOTEAPP_CANDIDATETABLE_NAME;

  const cognitoParams = {
    UserPoolId: process.env.AUTH_VOTEAPP0F2BAC26_USERPOOLID,
    Filter: `sub = "${sub}"`,
    Limit: 1,
  };

  const users = await cognito.listUsers(cognitoParams).promise();
  if (users.Users.length > 0) {
    const user = users.Users[0];
    const emailAttribute = user.Attributes.find(
      (attribute) => attribute.Name === "email"
    );

    if (!emailAttribute) {
      return {
        statusCode: 400,
        body: "user not found",
      };
    }

    userEmail = emailAttribute.Value;
  }

  const candidateParams = {
    TableName: candidateTableName,
    FilterExpression: "#email = :emailValue and #postId = :postIdValue",
    ExpressionAttributeNames: {
      "#email": "email",
      "#postId": "postId",
    },
    ExpressionAttributeValues: {
      ":emailValue": userEmail,
      ":postIdValue": postId,
    },
  };

  try {
    const dbItems = await ddb.scan(candidateParams).promise();
    console.log("Query succeeded.", dbItems);
    if (dbItems.Items.length <= 0) {
      return {
        statusCode: 402,
        body: "you are not haha !",
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }

  const dbParams = {
    TableName: voteTableName,
    FilterExpression: "#sub = :subValue and #postId = :postIdValue",
    ExpressionAttributeNames: {
      "#sub": "sub",
      "#postId": "postId",
    },
    ExpressionAttributeValues: {
      ":subValue": sub,
      ":postIdValue": postId,
    },
  };

  try {
    const dbItems = await ddb.scan(dbParams).promise();
    console.log("Query succeeded.", dbItems);
    if (dbItems.Items.length < 0) {
      return {
        statusCode: 401,
        body: "You are submitted",
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }

  const params = {
    TableName: voteTableName,
    Item: {
      id: uuidv4(),
      userId,
      postId,
      createdAt: new Date().toISOString(),
      vote,
    },
  };

  try {
    const res = await ddb.put(params).promise();
    console.log("Result: ", res);
    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    console.log("Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
