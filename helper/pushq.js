const fs = require('fs');
const request = require('request');

const pushqSecret = fs.readFileSync(`${__dirname}/../private/.pushq.json`).toString();
const parsedSecret = JSON.parse(pushqSecret);
const vault = parsedSecret.config;

/**
 * send <message> to pushq group <code> 
 * @param {String} message 
 * @param {String} code
 * @return {Promise} Promise object represents the response body
 */
function sendMessage(message, code) {
  if (code === null || code === undefined) {
    code = 'cloudbric';
  }
  let formData = { 
      'uuid': vault.uuid,
      'secret_key': vault.secretKey,
      'code': code,
      'body': message
  };

  return new Promise((resovle, reject) => {
    request.post({url: 'http://push.doday.net/api/push', formData: formData}, function optionalCallback(error, httpResponse, body) {
        if (error) {
          reject(error)
        } else {
          resovle(body);
        }
      });
  });
}

module.exports = {
  sendMessage: sendMessage
}