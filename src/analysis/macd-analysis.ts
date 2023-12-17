import { AngleOneHistoryOneCandleData } from '../interfaces/angle-one.interface';

export default class MACDCalculator {
  private historyData: AngleOneHistoryOneCandleData[];
  private shortPeriod: number;
  private longPeriod: number;
  private signalPeriod: number;

  /**
   * Creates an instance of MACDCalculator.
   * @param {AngleOneHistoryOneCandleData[]} data - Historical price data in the format [timestamp, open, high, low, close, volume][]
   * @param {number} shortPeriod - Number of data points to consider for the short-term moving average
   * @param {number} longPeriod - Number of data points to consider for the long-term moving average
   * @param {number} signalPeriod - Number of data points to consider for the signal line moving average
   */
  constructor(
    data: AngleOneHistoryOneCandleData[],
    shortPeriod: number,
    longPeriod: number,
    signalPeriod: number
  ) {
    this.historyData = data;
    this.shortPeriod = shortPeriod;
    this.longPeriod = longPeriod;
    this.signalPeriod = signalPeriod;
  }

  /**
   * Calculates the Moving Average Convergence Divergence (MACD) for the given historical data.
   * @returns {number[]} - Array of MACD values corresponding to each data point
   * @throws {Error} - If there is insufficient data to calculate MACD
   */
  calculateMACD(): number[] {
    if (this.historyData.length < this.longPeriod) {
      throw new Error('Insufficient data to calculate MACD');
    }

    const closingPrices = this.historyData.map((dataPoint) => dataPoint[4]);
    const shortMA = this.calculateMovingAverage(
      closingPrices,
      this.shortPeriod
    );
    const longMA = this.calculateMovingAverage(closingPrices, this.longPeriod);
    const macdLine = this.calculateMACDLine(shortMA, longMA);
    const signalLine = this.calculateSignalLine(macdLine);

    const macdValues: number[] = [];

    for (let i = this.longPeriod - 1; i < closingPrices.length; i++) {
      const macd = macdLine[i - this.longPeriod + 1];
      macdValues.push(macd);
    }

    return macdValues;
  }

  /**
   * Determines the momentum based on the MACD line.
   * @param {number[]} macdValues - Array of MACD values
   * @returns {string} - The momentum, either 'Positive', 'Negative', or 'Neutral'
   */
  determineMomentum(macdValues: number[]): string {
    const lastMACD = macdValues[macdValues.length - 1];

    if (lastMACD > 0) {
      return 'Positive';
    } else if (lastMACD < 0) {
      return 'Negative';
    } else {
      return 'Neutral';
    }
  }

  // Helper methods...

  private calculateMovingAverage(data: number[], timePeriod: number): number[] {
    const maValues: number[] = [];

    for (let i = timePeriod - 1; i < data.length; i++) {
      const sum = data
        .slice(i - timePeriod + 1, i + 1)
        .reduce((acc, price) => acc + price, 0);
      const ma = sum / timePeriod;
      maValues.push(ma);
    }

    return maValues;
  }

  private calculateMACDLine(shortMA: number[], longMA: number[]): number[] {
    const macdLine: number[] = [];

    for (let i = 0; i < longMA.length; i++) {
      const macd = shortMA[i] - longMA[i];
      macdLine.push(macd);
    }

    return macdLine;
  }

  private calculateSignalLine(macdLine: number[]): number[] {
    const signalLine = this.calculateMovingAverage(macdLine, this.signalPeriod);
    return signalLine;
  }
}
