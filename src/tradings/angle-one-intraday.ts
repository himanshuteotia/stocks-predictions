import { MACDandVWAPIndicators } from '../analysis/intraday/macd-vwap-analysis';
import {
  AngleOneHistoryOneCandleData,
  AngleOneHistoryParams
} from '../interfaces/angle-one.interface';
import AngelOneHistoricalService from '../services/angel-one/angle-one-historical.service';
import logger from '../utils/logger.util';

interface ADXData {
  timestamp: string;
  adx: number;
  plusDI: number;
  minusDI: number;
  momentum: 'Bullish' | 'Bearish' | 'Neutral';
}

export class AngleOneIntraday {
  constructor(private data: AngleOneHistoryOneCandleData[] = []) {}

  public async analyzeIntradayData(
    params: AngleOneHistoryParams
  ): Promise<any> {
    const response = await new AngelOneHistoricalService().getHistoryOfSymbol(
      params
    );
    this.data = response.data;
    const volumeMomentum = this.calculateIntradayVolumeMomentum();
    const { macd, vwap, macd_vmap_signals } = this.calculateMacdAndVWap();
    const volumeSpikes = this.findVolumeSpikes(10, 2);
    const adxData = this.calculateADX(this.data, 14);
    const rsiValues = this.calculateRSI(this.data);
    const rsiSignals = this.getRSISignal(rsiValues);

    return {
      volumeMomentum,
      macd,
      vwap,
      macd_vmap_signals,
      rsiSignals: rsiSignals.slice(rsiSignals.length - 14, rsiSignals.length),
      rsiValues: rsiValues.slice(rsiValues.length - 14, rsiValues.length),
      adxData: adxData.slice(adxData.length - 5, adxData.length),
      last_5_days_data: volumeSpikes.slice(
        volumeSpikes.length - 5,
        volumeSpikes.length
      )
    };
  }

  private calculateRSI(
    historicalData: AngleOneHistoryOneCandleData[],
    period: number = 14
  ): number[] {
    let gains = new Array(historicalData.length).fill(0);
    let losses = new Array(historicalData.length).fill(0);

    for (let i = 1; i < historicalData.length; i++) {
      const change = historicalData[i][4] - historicalData[i - 1][4];
      gains[i] = change > 0 ? change : 0;
      losses[i] = change < 0 ? -change : 0;
    }

    const avgGain: number[] = [];
    const avgLoss: number[] = [];

    for (let i = period; i < historicalData.length; i++) {
      if (i === period) {
        avgGain[i] =
          gains.slice(1, period + 1).reduce((a, b) => a + b) / period;
        avgLoss[i] =
          losses.slice(1, period + 1).reduce((a, b) => a + b) / period;
      } else {
        avgGain[i] = (avgGain[i - 1] * (period - 1) + gains[i]) / period;
        avgLoss[i] = (avgLoss[i - 1] * (period - 1) + losses[i]) / period;
      }
    }

    const RS: number[] = [];
    for (let i = period; i < avgGain.length; i++) {
      RS[i] = avgGain[i] / avgLoss[i];
    }

    const RSI: number[] = [];
    for (let i = period; i < RS.length; i++) {
      RSI[i] = 100 - 100 / (1 + RS[i]);
    }

    return RSI;
  }

  private getRSISignal(
    rsiValues: number[],
    overBought: number = 70,
    overSold: number = 30
  ): string[] {
    return rsiValues.map((rsi) => {
      if (rsi >= overBought) {
        return 'Sell';
      } else if (rsi <= overSold) {
        return 'Buy';
      } else {
        return 'Neutral';
      }
    });
  }

  private calculateMacdAndVWap() {
    const mACDandVWAPIndicators = new MACDandVWAPIndicators(
      this.data,
      12,
      26,
      9
    );
    const macd = mACDandVWAPIndicators.calculateMACD();
    const vwap = mACDandVWAPIndicators.calculateVWAP();
    const signals = mACDandVWAPIndicators.getSignals();

    return {
      macd: macd[macd.length - 1],
      vwap: vwap[vwap.length - 1],
      macd_vmap_signals: signals[signals.length - 1]
    };
  }

  private findVolumeSpikes(
    period: number,
    threshold: number
  ): AngleOneHistoryOneCandleData[] {
    const updatedData: any = [...this.data]; // Create a copy of the original data

    // Calculate average volume
    const startIndex = Math.max(this.data.length - period, 0);
    const endIndex = this.data.length;
    const volumeSum = this.data
      .slice(startIndex, endIndex)
      .reduce((sum, [_, __, ___, ____, _____, volume]) => sum + volume, 0);
    const averageVolume = volumeSum / period;

    // Identify volume spikes
    updatedData.forEach((stock) => {
      const volume = stock[5];
      if (volume > threshold * averageVolume) {
        stock.push(true); // Volume spike detected
      } else {
        stock.push(false); // No volume spike
      }
    });

    return updatedData;
  }

  private calculateIntradayVolumeMomentum() {
    const timestamps = this.data.map((entry) => entry[0]);
    const volumes = this.data.map((entry) => entry[5]);
    const closes = this.data.map((entry) => entry[4]);

    const startTimestamp = timestamps[0];
    const endTimestamp = timestamps[timestamps.length - 1];
    const totalVolume = volumes.reduce((sum, volume) => sum + volume, 0);
    const averageVolume = totalVolume / volumes.length;
    const momentum = (totalVolume - averageVolume) / averageVolume;

    const startPrice = closes[0];
    const endPrice = closes[closes.length - 1];
    const priceChange = endPrice - startPrice;

    let trend = 'Neutral';
    if (momentum > 0 && priceChange > 0) {
      trend = 'Bullish';
    } else if (momentum > 0 && priceChange < 0) {
      trend = 'Bearish';
    }

    return {
      startTimestamp,
      endTimestamp,
      totalVolume,
      averageVolume,
      momentum,
      trend
    };
  }

  private calculateADX(
    data: AngleOneHistoryOneCandleData[],
    period: number
  ): ADXData[] {
    if (data.length < period + 1) {
      throw new Error('Insufficient data to calculate ADX.');
    }

    const highValues = data.map((d) => d[2]);
    const lowValues = data.map((d) => d[3]);
    const closeValues = data.map((d) => d[4]);

    const trueRangeValues: number[] = [];
    const directionalMovementValues: number[][] = [];

    for (let i = 1; i < data.length; i++) {
      const highDiff = highValues[i] - highValues[i - 1];
      const lowDiff = lowValues[i - 1] - lowValues[i];
      const directionalMovement: number[] = [];

      if (highDiff > lowDiff && highDiff > 0) {
        directionalMovement.push(highDiff);
      } else {
        directionalMovement.push(0);
      }

      if (lowDiff > highDiff && lowDiff > 0) {
        directionalMovement.push(lowDiff);
      } else {
        directionalMovement.push(0);
      }

      directionalMovementValues.push(directionalMovement);

      const trueRange = Math.max(
        highValues[i] - lowValues[i],
        Math.abs(highValues[i] - closeValues[i - 1]),
        Math.abs(lowValues[i] - closeValues[i - 1])
      );
      trueRangeValues.push(trueRange);
    }

    const plusDMValues: number[] = [];
    const minusDMValues: number[] = [];

    for (let i = 0; i < directionalMovementValues.length; i++) {
      const plusDM = directionalMovementValues[i][0];
      const minusDM = directionalMovementValues[i][1];

      plusDMValues.push(plusDM);
      minusDMValues.push(minusDM);
    }

    const plusDIValues: number[] = [];
    const minusDIValues: number[] = [];
    const sumDXValues: number[] = [];

    for (let i = 0; i < period; i++) {
      // @ts-ignore
      plusDIValues.push(null);
      // @ts-ignore
      minusDIValues.push(null);
      // @ts-ignore
      sumDXValues.push(null);
    }

    let sumPlusDM = plusDMValues
      .slice(0, period)
      .reduce((sum, value) => sum + value, 0);
    let sumMinusDM = minusDMValues
      .slice(0, period)
      .reduce((sum, value) => sum + value, 0);

    let sumTrueRange = trueRangeValues
      .slice(0, period)
      .reduce((sum, value) => sum + value, 0);

    for (let i = period; i < data.length; i++) {
      const plusDI = (sumPlusDM / sumTrueRange) * 100;
      const minusDI = (sumMinusDM / sumTrueRange) * 100;
      const sumDX = Math.abs((plusDI - minusDI) / (plusDI + minusDI)) * 100;

      plusDIValues.push(plusDI);
      minusDIValues.push(minusDI);
      sumDXValues.push(sumDX);

      sumPlusDM -= plusDMValues[i - period];
      sumMinusDM -= minusDMValues[i - period];
      sumTrueRange -= trueRangeValues[i - period];

      sumPlusDM += plusDMValues[i];
      sumMinusDM += minusDMValues[i];
      sumTrueRange += trueRangeValues[i];
    }

    const smoothedDXValues: number[] = [];

    for (let i = 0; i < period * 2 - 1; i++) {
      // @ts-ignore
      smoothedDXValues.push(null);
    }

    for (let i = period * 2 - 1; i < data.length; i++) {
      const smoothedDX =
        sumDXValues
          .slice(i - period + 1, i + 1)
          .reduce((sum, value) => sum + value, 0) / period;
      smoothedDXValues.push(smoothedDX);
    }

    const adxValues: number[] = [];

    for (let i = period * 2 - 1; i < data.length; i++) {
      const adx = smoothedDXValues[i];
      adxValues.push(adx);
    }

    const adxData: ADXData[] = [];

    for (let i = period * 2 - 1; i < data.length; i++) {
      const momentum =
        plusDIValues[i] > minusDIValues[i]
          ? 'Bullish'
          : plusDIValues[i] < minusDIValues[i]
          ? 'Bearish'
          : 'Neutral';
      const adxEntry: ADXData = {
        timestamp: data[i][0],
        adx: adxValues[i - (period * 2 - 1)],
        plusDI: plusDIValues[i],
        minusDI: minusDIValues[i],
        momentum: momentum
      };
      adxData.push(adxEntry);
    }

    return adxData;
  }
}
