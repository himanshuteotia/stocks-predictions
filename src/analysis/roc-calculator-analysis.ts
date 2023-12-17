import { AngleOneHistoryOneCandleData } from '../interfaces/angle-one.interface';

export default class ROCCalculator {
  private historyData: AngleOneHistoryOneCandleData[];
  private timePeriod: number;

  /**
   * Creates an instance of ROCCalculator.
   * @param {AngleOneHistoryOneCandleData[]} data - Historical price data in the format [timestamp, open, high, low, close, volume][]
   * @param {number} timePeriod - Number of data points to consider for ROC calculation
   */
  constructor(data: AngleOneHistoryOneCandleData[], timePeriod: number) {
    this.historyData = data;
    this.timePeriod = timePeriod;
  }

  /**
   * Calculates the Rate of Change (ROC) for the given historical data.
   * @returns {number[]} - Array of ROC values corresponding to each data point
   * @throws {Error} - If there is insufficient data to calculate ROC
   */
  calculateROC(): number[] {
    if (this.historyData.length < this.timePeriod + 1) {
      throw new Error('Insufficient data to calculate ROC');
    }

    const closingPrices = this.historyData.map((dataPoint) => dataPoint[4]);
    const rocValues: number[] = [];

    for (let i = this.timePeriod; i < closingPrices.length; i++) {
      const priceAtBeginningPeriod = closingPrices[i - this.timePeriod];
      const priceAtEndPeriod = closingPrices[i];
      const roc =
        ((priceAtEndPeriod - priceAtBeginningPeriod) / priceAtBeginningPeriod) *
        100;
      rocValues.push(roc);
    }

    return rocValues;
  }

  /**
   * Determines the momentum based on the ROC values.
   * @param {number[]} rocValues - Array of ROC values
   * @returns {string} - The momentum, either 'Positive', 'Negative', or 'Neutral'
   */
  determineMomentum(rocValues: number[]): string {
    const lastROC = rocValues[rocValues.length - 1];

    if (lastROC > 0) {
      return 'Positive';
    } else if (lastROC < 0) {
      return 'Negative';
    } else {
      return 'Neutral';
    }
  }
}
