import axios, { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { authenticator } from 'otplib';
import config from '../../config/config';
import { getCommonHeaders } from './angle-one.utils';
import { AngleOneGenerateSessionResponse } from '../../interfaces/angle-one.interface';
import { AngleOneErrorCodes } from '../../enums/angle-one.enums';

export class AngleOneAuthentication {
  private static readonly CLIENT_CODE = config.angleOne.clientCode;
  private static readonly PIN = config.angleOne.pin;
  private static readonly TOTP = config.angleOne.totp;
  private static readonly LOGIN_PASSWORD_URL =
    'https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword';

  constructor() {}

  /**
   * Generates a new session for the given private key.
   * @param {string} privateKey - The private key to use for authentication.
   * @returns {Promise<AngleOneGenerateSessionResponse>} A Promise that resolves to the session data.
   * @throws {Error} If the session data is not available.
   */
  public async generateSession(
    privateKey: string
  ): Promise<AngleOneGenerateSessionResponse> {
    const totp = authenticator.generate(AngleOneAuthentication.TOTP);
    var data = JSON.stringify({
      clientcode: AngleOneAuthentication.CLIENT_CODE,
      password: AngleOneAuthentication.PIN,
      totp
    });

    var options: AxiosRequestConfig = {
      method: 'POST' as Method,
      url: AngleOneAuthentication.LOGIN_PASSWORD_URL,
      headers: {
        ...getCommonHeaders(),
        'X-PrivateKey': privateKey
      },
      data: data
    };

    const response: AxiosResponse<AngleOneGenerateSessionResponse> =
      await axios(options);

    const session = response.data;
    if (!session.data) {
      throw new Error(AngleOneErrorCodes[session.errorcode]);
    }

    return session;
  }
}
