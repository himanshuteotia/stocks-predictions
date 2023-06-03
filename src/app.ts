import express from 'express';
import compression from 'compression'; // compresses requests
import lusca from 'lusca';
import path from 'path';
import logger from './utils/logger.util';
import { RoutesV1 } from './routes/v1/v1.route';
import rateLimitRequestHandler from './middlewares/rate-limit.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';

class CustomError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export default class App {
  constructor(public port: number) {}

  createApp(): express.Application {
    const app: express.Application = express();
    app.use(compression());
    app.use(lusca.xframe('SAMEORIGIN'));
    app.use(lusca.xssProtection(true));
    app.use(
      express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
    );
    app.use(rateLimitRequestHandler());
    app.use(express.json());
    app.use(
      express.urlencoded({
        extended: true
      })
    );
    app.use(
      '/v1/',
      new LoggerMiddleware().endpointsLogs,
      new RoutesV1().router
    );
    app.use(
      (
        error: CustomError,
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
      ) => {
        // Handle the error here
        console.error(error);

        // Set the HTTP status code for the error
        response.status(error.status || 500);

        // Send an error response to the client
        response.json({
          error: {
            message: error.message || 'Internal Server Error'
          }
        });
      }
    );
    return app;
  }

  startServer(): void {
    const app = this.createApp();
    app.listen(this.port);
    logger.info(`Server is listening on ${this.port}`);
  }
}
