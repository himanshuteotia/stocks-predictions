import { AngleOneHistoryOneCandleData } from '../interfaces/angle-one.interface';

export default class MovingAveragesCalculator {
  private historyData: AngleOneHistoryOneCandleData[];
  private timePeriod: number;

  /**
   * Creates an instance of MovingAveragesCalculator.
   * @param {AngleOneHistoryOneCandleData[]} data - Historical price data in the format [timestamp, open, high, low, close, volume][]
   * @param {number} timePeriod - Number of data points to consider for the moving average calculation
   */
  constructor(data: AngleOneHistoryOneCandleData[], timePeriod: number) {
    this.historyData = data;
    this.timePeriod = timePeriod;
  }

  /**
   * Calculates the simple moving average (SMA) for the given historical data.
   * @returns {number[]} - Array of SMA values corresponding to each data point
   * @throws {Error} - If there is insufficient data to calculate SMA
   */
  calculateSMA(): number[] {
    if (this.historyData.length < this.timePeriod) {
      throw new Error('Insufficient data to calculate SMA');
    }

    const closingPrices = this.historyData.map((dataPoint) => dataPoint[4]);
    const smaValues: number[] = [];

    for (let i = this.timePeriod - 1; i < closingPrices.length; i++) {
      const sum = closingPrices
        .slice(i - this.timePeriod + 1, i + 1)
        .reduce((acc, price) => acc + price, 0);
      const sma = sum / this.timePeriod;
      smaValues.push(sma);
    }

    return smaValues;
  }

  /**
   * Determines the momentum based on the current price and the moving average.
   * @param {number} currentPrice - The current price
   * @param {number} movingAverage - The moving average
   * @returns {string} - The momentum, either 'Positive', 'Negative', or 'Neutral'
   */
  determineMomentum(currentPrice: number, movingAverage: number): string {
    if (currentPrice > movingAverage) {
      return 'Positive';
    } else if (currentPrice < movingAverage) {
      return 'Negative';
    } else {
      return 'Neutral';
    }
  }
}
