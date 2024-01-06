import { IConfig } from '../interfaces/config.interface';

export default {
  port: 3000,
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
