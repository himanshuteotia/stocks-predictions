
import merge from "deepmerge";
import production from './production';
import { IConfig } from '../interfaces/config.interface';

const config =  {
  port: 3000,
  debug:true,
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

export default merge(production,config);