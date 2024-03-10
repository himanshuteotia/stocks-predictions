import { IConfig } from '../interfaces/config.interface';

const config =  {
  port: 3000,
  debug:false,
  env: 'production',
  angleOne: {
    password: '',
    clientCode: '',
    historical: {
      apiKey: '',
      secretKey: ''
    },
    publisher: {
      apiKey: '',
      secretKey: ''
    }
  }
} as IConfig;

export default config;