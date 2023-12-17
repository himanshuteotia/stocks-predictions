import {
  AngleOneErrorCodes,
  AngleOneHistoryIntervals
} from '../enums/angle-one.enums';
import { ExcgangeTypes } from '../enums/exchange.enum';
import {
  MacdData,
  MovingAverageData,
  PriceChangeData,
  RocData,
  RsiData
} from './analysis.interface';

export type CustomTimeFormat = `${string} ${string}`; // Example: '2021-02-08 09:00'

export interface AngleOneHistoryParams {
  exchange: ExcgangeTypes;
  symboltoken: string;
  interval: AngleOneHistoryIntervals;
  fromdate: CustomTimeFormat;
  todate: CustomTimeFormat;
}

export interface AngleOneHistoryQueryParams {
  onlyMomentum?: boolean;
}

export interface AngleOneGenerateTokenResponse {
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
}

export interface AngleOneTokenGenerateResponse {
  data: AngleOneGenerateTokenResponse;
  status: boolean;
  message: string;
  errorcode: AngleOneErrorCodes;
}

// [timestamp, open, high, low, close, volume].
export type AngleOneHistoryOneCandleData = [
  string,
  number,
  number,
  number,
  number,
  number
];

export interface AngleOneHistoryResponse {
  status: boolean;
  message: string;
  errorcode: AngleOneErrorCodes;
  data: AngleOneHistoryOneCandleData[];
}

export interface StocksAnalysisData {
  priceChange: PriceChangeData;
  macd: MacdData;
  rsi: RsiData;
  roc: RocData;
  movingAverage: MovingAverageData;
}
