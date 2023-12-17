import { IConfig } from '../interfaces/config.interface';

export default {
  port: 3000,
  env: 'development',
  angleOne: {
    totp: 'TPMQ65H72DJ66VXVDOFWJYR2SM',
    password: 'Hacker@123',
    pin: '2283',
    clientCode: 'H253922',
    historical: {
      apiKey: '4mBQBWgY',
      secretKey: '13b44014-7573-4a3b-8caa-700223c21272'
    },
    publisher: {
      apiKey: '0ipPWaxt',
      secretKey: 'ce04aff1-452f-4b73-9ce0-d2392ec42eba'
    },
    symbolsURL:
      'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
  }
} as IConfig;
