const AWS = require("aws-sdk");
const { default: axios } = require("axios");
const sqs = new AWS.SQS();
const ssm = new AWS.SSM();

module.exports.sqsReciveHandler = async (event) => {
  console.log(event);
  try {
    const parameters = {
    Names: ['/Development/Lambda/API_KEY','/Development/Lambda/receiver-api-url'] 
    
  };
    const response = await ssm.getParameters(parameters).promise();
    const values = response.Parameters.map(parameter => parameter.Value);
    console.log(values)
    const config = {
      headers: { apikey: values[0] },
    };
    if (event.Records.length) {
      const syncLocationPromise = event.Records.map((element) => {
         const url =  values[1]+element.body
        return axios.post(url, {}, config);
      });
      const returnData = await Promise.all(syncLocationPromise);
      console.log(returnData);
    }
  } catch (err) {
    console.error("Error receiving messages:", err);
    throw err;
  }
};