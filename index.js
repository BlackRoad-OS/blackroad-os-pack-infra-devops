const { createServer } = require('./src/server');

const PORT = process.env.PORT || 8080;

const server = createServer();

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
