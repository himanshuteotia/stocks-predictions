import App from './src/app';

const PORT = 3000;
const app = new App(PORT);

// Handle the uncaught exception here
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception', error);
  // TODO: Perform cleanup operations if needed
  // Exit the process to prevent further execution
  process.exit(1);
});

// Handle the unhandled promise rejection here
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection', reason);
  // TODO: Perform cleanup operations if needed
  // Exit the process to prevent further execution
  process.exit(1);
});

app.startServer();
