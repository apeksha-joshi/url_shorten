// server.js
import app from '../src/app.js';

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Server running on port ${port}`);
        resolve(server);
      }
    });
  });
};

const stopServer = (server) => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Server closed');
        resolve();
      }
    });
  });
};

export { startServer, stopServer };