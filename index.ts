import App from './src/app';
import config from './src/config/config';

const PORT = config.port;
const app = new App(PORT);

// Handle the uncaught exception here
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception', error);
  process.exit(1);
});

// Handle the unhandled promise rejection here
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection', reason);
  process.exit(1);
});

app.startServer();
