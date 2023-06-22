const AWS = require("aws-sdk");
const axios = require("axios");
const sqs = new AWS.SQS();
const dotenv = require("dotenv")
const ssm = new AWS.SSM();
dotenv.config()

 module.exports.sqsSendHandler = async (event) => {



  try {
         const parameters = {
    Names: ['/Development/Lambda/API_KEY','/Development/Lambda/sender-api-url','/Development/Lambda/sqs-url']
    
  };
    const response = await ssm.getParameters(parameters).promise();
    const values = response.Parameters.map(parameter => parameter.Value);
    console.log(values)
    let params = {};
    const config = {
      headers: { apikey: values[0] },
    };
    const url = values[1];
    const locationList = await axios.get(url, config);
    if (locationList.data.response.length) {
    const messageArraySQS = locationList.data.response.map((element) => {
        params = {
          MessageBody: element.idLocation,
          QueueUrl: values[2],
        };
        return sqs.sendMessage(params).promise();
        //console.log("Message sent:", data.MessageId);
      });
    const returnData = await Promise.all(messageArraySQS);
    console.log(returnData);
      //return data.MessageId;
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
 };