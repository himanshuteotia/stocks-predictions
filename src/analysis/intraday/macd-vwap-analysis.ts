export class MACDandVWAPIndicators {
  private data: Array<[string, number, number, number, number, number]>;
  private macdShortPeriod: number;
  private macdLongPeriod: number;
  private signalPeriod: number;

  constructor(
    data: Array<[string, number, number, number, number, number]>,
    macdShortPeriod: number = 12,
    macdLongPeriod: number = 26,
    signalPeriod: number = 9
  ) {
    this.data = data;
    this.macdShortPeriod = macdShortPeriod;
    this.macdLongPeriod = macdLongPeriod;
    this.signalPeriod = signalPeriod;
  }

  private calculateEMA(period: number, price: number, prevEma: number): number {
    const smoothing = 2;
    return (
      price * (smoothing / (period + 1)) +
      prevEma * (1 - smoothing / (period + 1))
    );
  }

  public calculateMACD(): number[] {
    let shortEma: number, longEma: number;
    const macdLine: number[] = [],
      signalLine: number[] = [],
      histogram: number[] = [];

    this.data.forEach((row, idx) => {
      const price = row[4]; // close price

      if (idx === 0) {
        shortEma = price;
        longEma = price;
      } else {
        shortEma = this.calculateEMA(this.macdShortPeriod, price, shortEma);
        longEma = this.calculateEMA(this.macdLongPeriod, price, longEma);
      }

      const macd = shortEma - longEma;
      macdLine.push(macd);

      // For signal line
      if (idx >= this.macdLongPeriod) {
        const prevSignal =
          idx > this.macdLongPeriod ? signalLine[signalLine.length - 1] : macd;
        const signal = this.calculateEMA(this.signalPeriod, macd, prevSignal);
        signalLine.push(signal);

        // Histogram
        histogram.push(macd - signal);
      }
    });

    return histogram;
  }

  public calculateVWAP(): number[] {
    let cumulativeTPV = 0; // Cumulative Typical Price * Volume
    let cumulativeVolume = 0;
    const vwap: number[] = [];

    this.data.forEach((row) => {
      const high = row[2];
      const low = row[3];
      const close = row[4];
      const volume = row[5];

      const typicalPrice = (high + low + close) / 3;
      const tpv = typicalPrice * volume;

      cumulativeTPV += tpv;
      cumulativeVolume += volume;

      vwap.push(cumulativeTPV / cumulativeVolume);
    });

    return vwap;
  }

  public getSignals(): string[] {
    const macdHistogram = this.calculateMACD();
    const vwap = this.calculateVWAP().slice(this.macdLongPeriod);
    const closePrices = this.data
      .map((row) => row[4])
      .slice(this.macdLongPeriod);
    const signals: string[] = [];

    for (let i = 0; i < macdHistogram.length; i++) {
      if (macdHistogram[i] > 0 && closePrices[i] > vwap[i]) {
        signals.push('Bullish');
      } else if (macdHistogram[i] < 0 && closePrices[i] < vwap[i]) {
        signals.push('Bearish');
      } else {
        signals.push('Neutral');
      }
    }

    return signals;
  }
}
