import axios, { Method, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../../config/config';
import { AngleOneAuthentication } from './angle-one-authentication';
import {
  AngleOneHistoryParams,
  AngleOneHistoryResponse
} from '../../interfaces/angle-one.interface';
import { getCommonHeaders } from './angle-one.utils';
import logger from '../../utils/logger.util';
import { AngleOneErrorCodes } from '../../enums/angle-one.enums';

export default class AngelOneHistoricalService {
  private static readonly privateKey = config.angleOne.publisher.apiKey;
  constructor() {}

  private getHistoryOptions(
    params: AngleOneHistoryParams,
    authToken: string
  ): AxiosRequestConfig {
    const historyData = JSON.stringify(params);
    return {
      method: 'POST' as Method,
      url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData',
      headers: {
        // TODO: Make private key dynamic
        'X-PrivateKey': AngelOneHistoricalService.privateKey,
        Authorization: authToken,
        ...getCommonHeaders()
      },
      data: historyData
    };
  }

  public async getHistoryOfSymbol(
    params: AngleOneHistoryParams
  ): Promise<AngleOneHistoryResponse> {
    const session = await new AngleOneAuthentication().generateSession(
      config.angleOne.publisher.apiKey
    );
    const jwtToken = session.data.jwtToken;
    const authToken = `Bearer ${jwtToken}`;
    const historyOptions = this.getHistoryOptions(params, authToken);

    const response: AxiosResponse<AngleOneHistoryResponse> = await axios(
      historyOptions
    );
    const history = response.data;
    if (!history.data) {
      throw new Error(AngleOneErrorCodes[session.errorcode]);
    }
    return history;
  }
}
