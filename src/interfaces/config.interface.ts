export interface IConfig {
  port: number;
  env: string;
  debug: boolean;
  angleOne: {
    totp: string;
    clientCode: string;
    password: string;
    pin: string;
    historical: {
      apiKey: string;
      secretKey: string;
    };
    publisher: {
      apiKey: string;
      secretKey: string;
    };
  };
}
