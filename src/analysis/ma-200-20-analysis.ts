import { AngleOneHistoryOneCandleData } from '../interfaces/angle-one.interface';

export default class MovingAverages200And20 {
  private prices: number[];

  constructor(prices: AngleOneHistoryOneCandleData[]) {
    this.prices = prices.map((price) => price[4]); // Extracting the closing prices from the historical data
  }

  calculateMovingAverage(window: number): number[] {
    const movingAverages: number[] = [];

    for (let i = window - 1; i < this.prices.length; i++) {
      const sum = this.prices
        .slice(i - window + 1, i + 1)
        .reduce((acc, price) => acc + price, 0);
      const average = sum / window;
      movingAverages.push(average);
    }

    return movingAverages;
  }

  calculateMomentum(): string {
    const shortTermMA = this.calculateMovingAverage(20);
    const longTermMA = this.calculateMovingAverage(200);

    if (
      shortTermMA[shortTermMA.length - 1] > longTermMA[longTermMA.length - 1]
    ) {
      return 'Positive';
    } else {
      return 'Negative';
    }
  }
}
