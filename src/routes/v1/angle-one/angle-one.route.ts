import { NextFunction, Request, Response } from 'express';
import AngelOneHistoricalService from '../../../services/angel-one/angle-one-historical.service';
import logger from '../../../utils/logger.util';
import { AngleOneHistoryResponse } from '../../../interfaces/angle-one.interface';

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
}
