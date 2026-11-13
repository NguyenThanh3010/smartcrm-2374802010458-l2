const path = require('node:path');

require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

const app = require('./src/app');
const { pool } = require('./src/db');

const port = Number(process.env.APP_PORT) || 3000;

const server = app.listen(port, () => {
  console.log(`Smart CRM API đang chạy tại http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`\nNhận ${signal}, đang dừng server...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log('Server và database connection đã đóng.');
      process.exit(0);
    } catch (error) {
      console.error('[SHUTDOWN ERROR]', {
        name: error.name,
        code: error.code || 'UNKNOWN',
      });
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
