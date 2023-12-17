import { NextFunction, Request, Response } from 'express';
import AngelOneHistoricalService from '../../../services/angel-one/angle-one-historical.service';
import logger from '../../../utils/logger.util';
import {
  AngleOneHistoryParams,
  AngleOneHistoryResponse,
  StocksAnalysisData
} from '../../../interfaces/angle-one.interface';
import {
  generateDateRange,
  isOutsideTradingTime
} from '../../../utils/date.util';
import { ExcgangeTypes } from '../../../enums/exchange.enum';
import { AngleOneHistoryIntervals } from '../../../enums/angle-one.enums';
import { AngleOneIntraday } from '../../../tradings/angle-one-intraday';

export class AngleOneRoute {
  public async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const historicalService = new AngelOneHistoricalService();
    try {
      const data = await historicalService.getHistoryOfSymbol(req.body);
      res.status(200).send(data);
    } catch (error) {
      logger.error('error');
      next(error);
    }
  }

  public async getStocksAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const historicalService = new AngelOneHistoricalService();
    try {
      const body = req.body as AngleOneHistoryParams;
      const query = req.query;
      if (!body.fromdate && !body.todate) {
        const dates = generateDateRange();
        body.todate = dates[dates.length - 1];
        body.fromdate = dates[0];
      }
      if (!body.exchange) {
        body.exchange = ExcgangeTypes.NSE;
      }
      logger.info('body', body);
      const data = await historicalService.getStocksAnalysis(body, query);

      res.status(200).send(data);
    } catch (error) {
      logger.error('error');
      next(error);
    }
  }

  public async getIntradayStocksAnalysis(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const body = req.body as AngleOneHistoryParams;
      const query = req.query;

      // check if current time is between 9:15 and 15:30
      // const tradingTime = isOutsideTradingTime();
      // if (!tradingTime) {
      //   res.status(200).send({
      //     status: false,
      //     message: 'Trading time is over',
      //     errorcode: 0,
      //     data: {}
      //   });
      // }

      const data = await new AngleOneIntraday().analyzeIntradayData(body);

      res.status(200).send(data);
    } catch (error) {
      logger.error('error');
      next(error);
    }
  }
}
