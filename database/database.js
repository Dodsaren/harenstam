const { Pool } = require('pg')

const { db } = require('../config')

const pool = new Pool(db)

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

async function execute(query, values = null) {
  try {
    const { rows } = await pool.query(query, values)
    return rows
  } catch (err) {
    console.log('query', query)
    console.log('ERROR', err)
    return err
  }
}

module.exports = { pool, execute }
