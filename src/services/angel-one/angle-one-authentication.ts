import axios, { AxiosRequestConfig, Method, AxiosResponse } from 'axios';
import { authenticator } from 'otplib';
import config from '../../config/config';
import { getCommonHeaders } from './angle-one.utils';
import {
  AngleOneTokenGenerateResponse,
  AngleOneGenerateTokenResponse
} from '../../interfaces/angle-one.interface';
import { AngleOneErrorCodes } from '../../enums/angle-one.enums';
import NodeCache from 'node-cache';

const nodeCache = new NodeCache({ deleteOnExpire: false });

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
  ): Promise<AngleOneTokenGenerateResponse> {
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

    const response: AxiosResponse<AngleOneTokenGenerateResponse> = await axios(
      options
    );

    const session = response.data;
    if (!session.data) {
      throw new Error(AngleOneErrorCodes[session.errorcode]);
    }

    return session;
  }

  public async generateToken(): Promise<AngleOneGenerateTokenResponse> {
    // If token is already available in Redis, return it.
    const clientId = config.angleOne.clientCode;
    const token = this.getToken(clientId);
    const timeToLive = this.getTimeToLive(clientId);

    if (token && timeToLive) {
      return token;
    }

    const refreshToken = token?.refreshToken;

    if (!refreshToken) {
      const session = await this.generateSession(
        config.angleOne.publisher.apiKey
      );
      this.saveToken(clientId, session.data);
      return session.data;
    }

    const jwtToken = token?.jwtToken;
    const authToken = `Bearer ${jwtToken}`;

    const data = JSON.stringify({
      refreshToken
    });

    const options: AxiosRequestConfig = {
      method: 'POST' as Method,
      url: 'https://apiconnect.angelbroking.com/rest/auth/angelbroking/jwt/v1/generateTokens',
      headers: {
        ...getCommonHeaders(),
        Authorization: authToken,
        'X-PrivateKey': config.angleOne.publisher.apiKey
      },
      data: data
    };

    const response: AxiosResponse<AngleOneTokenGenerateResponse> = await axios(
      options
    );

    const tokens = response.data;
    if (!tokens.data) {
      throw new Error(AngleOneErrorCodes[tokens.errorcode]);
    }

    this.saveToken(clientId, tokens.data);

    return tokens.data;
  }

  private saveToken(
    clientId: string,
    token: AngleOneGenerateTokenResponse,
    expirationInSeconds = 3600
  ) {
    nodeCache.set(clientId, token, expirationInSeconds);
  }

  private getToken(
    clientId: string
  ): AngleOneGenerateTokenResponse | undefined {
    return nodeCache.get(clientId);
  }

  private getTimeToLive(clientId): boolean {
    return nodeCache.ttl(clientId);
  }
}
