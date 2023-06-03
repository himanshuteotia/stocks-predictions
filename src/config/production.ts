import { IConfig } from '../interfaces/config.interface';

export default {
  port: 3000,
  env: 'production',
  angleOne: {
    password: 'Hacker@123',
    clientCode: 'H253922',
    historical: {
      apiKey: '4mBQBWgY',
      secretKey: '13b44014-7573-4a3b-8caa-700223c21272'
    },
    publisher: {
      apiKey: '4mBQBWgY',
      secretKey: '13b44014-7573-4a3b-8caa-700223c21272'
    }
  }
} as IConfig;
