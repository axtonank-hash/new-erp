/**
 * MySQL Database Helper Module
 * Manages connections, queries, and transactions
 */

const mysql = require('mysql2/promise');

// Connection pool configuration
let pool = null;

/**
 * Initialize connection pool
 * @returns {Promise<void>}
 */
async function initializePool() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'gegok12',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    });

    console.log('✅ MySQL connection pool initialized');
    return pool;
  } catch (error) {
    console.error('❌ Failed to initialize connection pool:', error);
    throw error;
  }
}

/**
 * Get connection from pool
 * @returns {Promise<Connection>}
 */
async function getConnection() {
  if (!pool) {
    await initializePool();
  }
  return pool.getConnection();
}

/**
 * Execute query with parameters
 * @param {string} sql - SQL query with ? placeholders
 * @param {Array} values - Parameter values
 * @returns {Promise<Array>} [rows, fields]
 */
async function query(sql, values = []) {
  const connection = await getConnection();
  try {
    const [rows, fields] = await connection.query(sql, values);
    return [rows, fields];
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Execute query returning first row only
 * @param {string} sql - SQL query
 * @param {Array} values - Parameter values
 * @returns {Promise<Object|null>}
 */
async function queryOne(sql, values = []) {
  const [rows] = await query(sql, values);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Insert record
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Insert result with insertId
 */
async function insert(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  
  const connection = await getConnection();
  try {
    const [result] = await connection.query(sql, values);
    return {
      success: true,
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('❌ Insert error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Update records
 * @param {string} table - Table name
 * @param {Object} data - Data to update
 * @param {Object} where - WHERE conditions
 * @returns {Promise<Object>} Update result
 */
async function update(table, data, where) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  const allValues = [...values, ...whereValues];
  
  const connection = await getConnection();
  try {
    const [result] = await connection.query(sql, allValues);
    return {
      success: true,
      changedRows: result.changedRows,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('❌ Update error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Delete records
 * @param {string} table - Table name
 * @param {Object} where - WHERE conditions
 * @returns {Promise<Object>} Delete result
 */
async function deleteRecord(table, where) {
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  
  const connection = await getConnection();
  try {
    const [result] = await connection.query(sql, whereValues);
    return {
      success: true,
      affectedRows: result.affectedRows
    };
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Select records with filtering and pagination
 * @param {string} table - Table name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Query results
 */
async function select(table, options = {}) {
  const {
    where = {},
    select = '*',
    orderBy = null,
    limit = null,
    offset = 0,
    join = null
  } = options;

  let sql = `SELECT ${select} FROM ${table}`;
  let values = [];

  // Add joins
  if (join) {
    sql += ` ${join}`;
  }

  // Add WHERE clause
  const whereKeys = Object.keys(where);
  if (whereKeys.length > 0) {
    const whereConditions = whereKeys.map(key => `${key} = ?`).join(' AND ');
    sql += ` WHERE ${whereConditions}`;
    values = Object.values(where);
  }

  // Add ORDER BY
  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`;
  }

  // Add LIMIT and OFFSET
  if (limit) {
    sql += ` LIMIT ? OFFSET ?`;
    values.push(limit, offset);
  }

  return query(sql, values);
}

/**
 * Execute transaction
 * @param {Function} callback - Callback function with connection
 * @returns {Promise<any>} Callback result
 */
async function transaction(callback) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Execute raw query with transaction
 * @param {Connection} connection - Active connection
 * @param {string} sql - SQL query
 * @param {Array} values - Parameter values
 * @returns {Promise<Array>} Query results
 */
async function transactionQuery(connection, sql, values = []) {
  const [rows, fields] = await connection.query(sql, values);
  return [rows, fields];
}

/**
 * Count records
 * @param {string} table - Table name
 * @param {Object} where - WHERE conditions
 * @returns {Promise<number>} Record count
 */
async function count(table, where = {}) {
  const whereKeys = Object.keys(where);
  let sql = `SELECT COUNT(*) as count FROM ${table}`;
  let values = [];

  if (whereKeys.length > 0) {
    const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
    sql += ` WHERE ${whereClause}`;
    values = Object.values(where);
  }

  const result = await queryOne(sql, values);
  return result ? result.count : 0;
}

/**
 * Check if record exists
 * @param {string} table - Table name
 * @param {Object} where - WHERE conditions
 * @returns {Promise<boolean>}
 */
async function exists(table, where = {}) {
  const recordCount = await count(table, where);
  return recordCount > 0;
}

/**
 * Get last insert ID
 * @param {string} table - Table name
 * @returns {Promise<number>}
 */
async function getLastInsertId(table) {
  const result = await queryOne('SELECT LAST_INSERT_ID() as id');
  return result ? result.id : null;
}

/**
 * Batch insert multiple records
 * @param {string} table - Table name
 * @param {Array<Object>} records - Records to insert
 * @returns {Promise<Object>} Result
 */
async function batchInsert(table, records) {
  if (!records || records.length === 0) {
    return { success: false, error: 'No records to insert' };
  }

  const keys = Object.keys(records[0]);
  const placeholders = keys.map(() => '?').join(', ');
  const values = records.flatMap(record => Object.values(record));
  const recordPlaceholders = records.map(() => `(${placeholders})`).join(', ');

  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${recordPlaceholders}`;

  const connection = await getConnection();
  try {
    const [result] = await connection.query(sql, values);
    return {
      success: true,
      insertedRows: result.affectedRows,
      insertId: result.insertId
    };
  } catch (error) {
    console.error('❌ Batch insert error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Execute raw SQL query
 * @param {string} sql - Raw SQL query
 * @param {Array} values - Parameter values
 * @returns {Promise<Array>}
 */
async function raw(sql, values = []) {
  return query(sql, values);
}

/**
 * Close connection pool
 * @returns {Promise<void>}
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Connection pool closed');
  }
}

/**
 * Health check - test database connection
 * @returns {Promise<boolean>}
 */
async function healthCheck() {
  try {
    const connection = await getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

module.exports = {
  initializePool,
  getConnection,
  query,
  queryOne,
  insert,
  update,
  deleteRecord,
  select,
  transaction,
  transactionQuery,
  count,
  exists,
  getLastInsertId,
  batchInsert,
  raw,
  closePool,
  healthCheck
};
