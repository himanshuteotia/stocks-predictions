import { IConfig } from '../interfaces/config.interface';

export default {
  port: 3000,
  env: 'development',
  angleOne: {
    totp: '',
    password: '',
    pin: '',
    clientCode: '',
    historical: {
      apiKey: '',
      secretKey: ''
    },
    publisher: {
      apiKey: '',
      secretKey: ''
    },
    symbolsURL:
      'https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json'
  }
} as IConfig;
