export interface PriceChangeData {
  priceChangePercentage?: number;
  momentum?: string;
}

export interface MacdData {
  macdValues?: number[];
  momentum?: string;
}

export interface RocData {
  rocValues?: number[];
  momentum?: string;
}

export interface RsiData {
  rsiValues?: number[];
  momentum?: string;
}

export interface MovingAverageData {
  smaValues?: number[];
  momentum?: string;
}
