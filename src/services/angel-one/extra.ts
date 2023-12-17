var axios = require('axios');
const { authenticator } = require('otplib');
const secret = 'TPMQ65H72DJ66VXVDOFWJYR2SM';
const token = authenticator.generate(secret);
var data = JSON.stringify({
  clientcode: 'H253922',
  password: '2283',
  totp: token
});

var config = {
  method: 'post',
  url: 'https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword',

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-UserType': 'USER',
    'X-SourceID': 'WEB',
    'X-ClientLocalIP': '192.168..29.188',
    'X-ClientPublicIP': '192.168..29.188',
    'X-MACAddress': 'ac:49:db:dd:78:b1',
    'X-PrivateKey': '0ipPWaxt'
  },
  data: data
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });

// https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json
