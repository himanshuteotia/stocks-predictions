import { AngleOneHistoryOneCandleData } from '../interfaces/angle-one.interface';
/**
 * A class for calculating price change percentage and momentum.
 */
export default class PriceChangeCalculator {
  private historyData: AngleOneHistoryOneCandleData[];

  /**
   * Creates a new instance of the PriceChangeCalculator class.
   * @param {AngleOneHistoryOneCandleData[]} data - The historical data in the format [[timestamp, open, high, low, close, volume], ...].
   */
  constructor(data: AngleOneHistoryOneCandleData[]) {
    this.historyData = data;
  }

  /**
   * Calculates the price change percentage over a specified time period.
   * @param {number} timePeriod - The time period over which to calculate the price change percentage.
   * @returns {number} The price change percentage.
   * @throws {Error} If there is insufficient data to calculate the price change percentage.
   */

  calculatePriceChangePercentage(timePeriod: number): number {
    if (this.historyData.length < timePeriod) {
      throw new Error('Insufficient data to calculate price change percentage');
    }

    const closingPrices = this.historyData.map((dataPoint) => dataPoint[4]);
    const priceChange =
      closingPrices[closingPrices.length - 1] -
      closingPrices[closingPrices.length - timePeriod];
    const priceChangePercentage =
      (priceChange / closingPrices[closingPrices.length - timePeriod]) * 100;

    return priceChangePercentage;
  }

  /**
   * Determines the momentum based on the price change percentage.
   * @param {number} priceChangePercentage - The price change percentage.
   * @returns {string} The momentum, which can be 'Positive', 'Negative', or 'Neutral'.
   */

  determineMomentum(priceChangePercentage: number): string {
    if (priceChangePercentage > 0) {
      return 'Positive';
    } else if (priceChangePercentage < 0) {
      return 'Negative';
    } else {
      return 'Neutral';
    }
  }
}
