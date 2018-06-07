// Update with your config settings.

const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  dotenv.config();
}

module.exports = {
  development: {
    client: 'sqlite3',
    debug: false,
    useNullAsDefault: true,
    connection: {
      filename: './cache.sqlite',
    },
    migrations: {
      // stub: './config/knex-migration-stub.js',
      tableName: 'migration',
      directory: 'src/libs/db/migrations',
    },
    seeds: {
      // stub: './config/knex-migration-stub.js',
      tableName: 'seed',
      directory: 'src/libs/db/seeds',
    },
  },
};
