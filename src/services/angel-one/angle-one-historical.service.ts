import axios, { Method, AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../../config/config';
import { AngleOneAuthentication } from './angle-one-authentication';
import {
  AngleOneHistoryParams,
  AngleOneHistoryQueryParams,
  AngleOneHistoryResponse,
  StocksAnalysisData
} from '../../interfaces/angle-one.interface';
import { getCommonHeaders } from './angle-one.utils';
import { AngleOneErrorCodes } from '../../enums/angle-one.enums';
import PriceChangeCalculator from '../../analysis/price-change-analysis';
import MACDCalculator from '../../analysis/macd-analysis';
import {
  MacdData,
  MovingAverageData,
  PriceChangeData,
  RocData,
  RsiData
} from '../../interfaces/analysis.interface';
import RSICalculator from '../../analysis/rsi-analysis';
import ROCCalculator from '../../analysis/roc-calculator-analysis';
import MovingAveragesCalculator from '../../analysis/moving-avarages-analysis';
import MovingAverages200And20 from '../../analysis/ma-200-20-analysis';

export default class AngelOneHistoricalService {
  private static readonly privateKey = config.angleOne.publisher.apiKey;

  private getHistoryOptions(
    params: AngleOneHistoryParams,
    authToken: string
  ): AxiosRequestConfig {
    const historyData = JSON.stringify(params);
    return {
      method: 'POST' as Method,
      url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/historical/v1/getCandleData',
      headers: {
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
    const session = await new AngleOneAuthentication().generateToken();
    const jwtToken = session.jwtToken;
    const authToken = `Bearer ${jwtToken}`;
    const historyOptions = this.getHistoryOptions(params, authToken);

    const response: AxiosResponse<AngleOneHistoryResponse> = await axios(
      historyOptions
    );
    const history = response.data;
    console.log(response);
    if (!history.data) {
      throw new Error(AngleOneErrorCodes[history.errorcode]);
    }
    return history;
  }

  private async getPriceChangeData(
    historyData: AngleOneHistoryResponse
  ): Promise<PriceChangeData> {
    const calculator = new PriceChangeCalculator(historyData.data);
    const priceChangePercentage = calculator.calculatePriceChangePercentage(
      historyData.data.length - 1
    );
    const momentum = calculator.determineMomentum(priceChangePercentage);
    return {
      priceChangePercentage,
      momentum
    };
  }

  private async getMacdData(
    historyData: AngleOneHistoryResponse
  ): Promise<MacdData> {
    const shortPeriod = 6; // Short-term moving average period
    const longPeriod = 13; // Long-term moving average period
    const signalPeriod = 9; // Signal line moving average period
    const calculator = new MACDCalculator(
      historyData.data,
      shortPeriod,
      longPeriod,
      signalPeriod
    );
    const macdValues = calculator.calculateMACD();
    const momentum = calculator.determineMomentum(macdValues);
    return {
      macdValues,
      momentum
    };
  }

  private async getRsiData(
    historyData: AngleOneHistoryResponse
  ): Promise<RsiData> {
    const timePeriod = 14; // Time period for RSI calculation
    const calculator = new RSICalculator(historyData.data);
    const rsiValues = calculator.calculateRSI(timePeriod);
    const momentum = calculator.calculateMomentum(rsiValues);
    return {
      rsiValues,
      momentum
    };
  }

  private async getRocData(
    historyData: AngleOneHistoryResponse
  ): Promise<RocData> {
    const timePeriod = 14; // Time period for ROC calculation
    const calculator = new ROCCalculator(historyData.data, timePeriod);
    const rocValues = calculator.calculateROC();
    const momentum = calculator.determineMomentum(rocValues);

    return {
      rocValues,
      momentum
    };
  }

  private async getMovingAverageData(
    historyData: AngleOneHistoryResponse
  ): Promise<MovingAverageData> {
    const timePeriod = 14;
    const calculator = new MovingAveragesCalculator(
      historyData.data,
      timePeriod
    );
    const smaValues = calculator.calculateSMA();
    const currentPrice = historyData.data[historyData.data.length - 1][4];
    const movingAverage = smaValues[smaValues.length - 1];

    const momentum = calculator.determineMomentum(currentPrice, movingAverage);

    return {
      smaValues,
      momentum
    };
  }

  private async getMovingAvg200And20Data(
    historyData: AngleOneHistoryResponse
  ): Promise<{ momentum: string }> {
    const movingAverages = new MovingAverages200And20(historyData.data);
    const momentum = movingAverages.calculateMomentum();
    return {
      momentum
    };
  }

  public async getStocksAnalysis(
    params: AngleOneHistoryParams,
    query: AngleOneHistoryQueryParams = {}
  ): Promise<Partial<StocksAnalysisData>> {
    const history = await this.getHistoryOfSymbol(params);
    const priceChangeData = await this.getPriceChangeData(history);
    const macdData = await this.getMacdData(history);
    const rsiData = await this.getRsiData(history);
    const rocData = await this.getRocData(history);
    const movingAverageData = await this.getMovingAverageData(history);
    const movingAverage200And20Data = await this.getMovingAvg200And20Data(
      history
    );

    if (query.onlyMomentum) {
      const data = {
        priceChange: { momentum: priceChangeData.momentum },
        macd: { momentum: macdData.momentum },
        rsi: { momentum: rsiData.momentum },
        roc: { momentum: rocData.momentum },
        movingAverage: { momentum: movingAverageData.momentum },
        movingAverage200And20: { momentum: movingAverage200And20Data.momentum }
      };
      return data;
    }

    const data = {
      priceChange: priceChangeData,
      macd: macdData,
      rsi: rsiData,
      roc: rocData,
      movingAverage: movingAverageData,
      movingAverage200And20: movingAverage200And20Data
    };
    return data;
  }
}
