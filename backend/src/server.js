// Entry point: connect to the database first, then start listening
const { port } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

async function start() {
  await connectDB();
  app.listen(port, () => console.log(`MiniStore running at http://localhost:${port}`));
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

start();
