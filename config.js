'use strict'

const env = process.env.NODE_ENV

const dev = {
  db: {},
}

const test = {
  db: {
    user: 'postgres',
    host: 'localhost',
    database: 'testdb',
    port: 5432,
  },
}

const config = {
  dev,
  test,
}

module.exports = config[env]
