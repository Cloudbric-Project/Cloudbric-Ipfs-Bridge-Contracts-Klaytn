const fs = require('fs');
const request = require('request');
const path = require('path');

const appDir = path.dirname('index.js');
const pushqSecret = fs.readFileSync(`${appDir}/helper/.pushq.json`).toString();

const parsedSecret = JSON.parse(pushqSecret);
const vault = parsedSecret.config;

let formData = { 
    'uuid': vault.uuid,
    'secret_key': vault.secretKey,
    'code': vault.code,
    'body': 'test'
};

request.post({url: 'http://push.doday.net/api/push', formData: formData}, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.log('Upload successful!  Server responded with:', body);
  });