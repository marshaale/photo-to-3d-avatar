import { config } from '@/config';
import app from './app';

const startServer = async () => {
  try {
    const server = app.listen(config.PORT, () =>
      console.log(`Server is running on http://localhost:${config.PORT}`),
    );

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `Port ${config.PORT} is already in use. Please choose a different port.`,
          error,
        );
      } else {
        console.error('Error starting the server:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
};

startServer();
