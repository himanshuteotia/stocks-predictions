import { AngleOneHistoryOneCandleData } from '../interfaces/angle-one.interface';

export default class RSICalculator {
  private prices: number[];

  constructor(prices: AngleOneHistoryOneCandleData[]) {
    this.prices = prices.map((price) => price[4]); // Extracting the closing prices from the historical data
  }

  calculateRSI(period: number): number[] {
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < this.prices.length; i++) {
      const priceDiff = this.prices[i] - this.prices[i - 1];
      if (priceDiff > 0) {
        gains.push(priceDiff);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(-priceDiff);
      }
    }

    let avgGain = this.calculateAverage(gains.slice(0, period));
    let avgLoss = this.calculateAverage(losses.slice(0, period));

    const rsiValues: number[] = [];
    rsiValues.push(100 - 100 / (1 + avgGain / avgLoss));

    for (let i = period; i < this.prices.length; i++) {
      const currGain = gains[i - 1];
      const currLoss = losses[i - 1];

      avgGain = (avgGain * (period - 1) + currGain) / period;
      avgLoss = (avgLoss * (period - 1) + currLoss) / period;

      const rsi = 100 - 100 / (1 + avgGain / avgLoss);
      rsiValues.push(rsi);
    }

    return rsiValues;
  }

  calculateAverage(values: number[]): number {
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  }

  calculateMomentum(rsiValues: number[]): string {
    if (rsiValues[rsiValues.length - 1] > 50) {
      return 'Positive';
    } else {
      return 'Negative';
    }
  }
}
