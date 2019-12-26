const fs = require('fs')
const path = require('path')
const request = require('request')

const APP_ROOT_DIR = path.join(__dirname, '..')
const pushq = fs.readFileSync(path.join(APP_ROOT_DIR, 'private/.pushq.json')).toString()
const pushqSecret = JSON.parse(pushq)
const vault = pushqSecret.config

/**
 * send <message> to pushq group <code> 
 * @param {String} message
 * @param {String} code
 * @return {Promise} Promise object represents the response body
 */
function sendMessage(message, code) {
  if (code === null || code === undefined) {
    code = 'CB-DEV'
  }
  let formData = { 
      'uuid': vault.uuid,
      'secret_key': vault.secretKey,
      'code': code,
      'body': message
  };

  return new Promise((resovle, reject) => {
    request.post({
      url: 'http://push.doday.net/api/push', formData: formData}, 
      function optionalCallback(error, httpResponse, body) {
        if (error) {
          reject(error)
        } else {
          resovle(body)
        }
      })
  })
}

module.exports = {
  sendMessage: sendMessage
}