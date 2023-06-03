import development from './development';
import production from './production';
import { IConfig } from '../interfaces/config.interface';

let config: IConfig;

if (process.env.NODE_ENV === 'production') {
  config = production;
} else {
  config = development;
}

export default config;
