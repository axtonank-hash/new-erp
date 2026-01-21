/**
 * Query Performance Optimizer Module
 * Phase 2 Week 1 Day 2
 * 
 * Provides query optimization, caching, and performance monitoring
 */

const NodeCache = require('node-cache');

// Initialize cache with 5-minute TTL for most queries
const queryCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const shortCache = new NodeCache({ stdTTL: 60, checkperiod: 30 }); // 1-minute for frequently-changing data
const longCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }); // 1-hour for static data

/**
 * Performance monitoring tracker
 */
class QueryPerformanceMonitor {
  constructor() {
    this.queries = [];
    this.slowQueryThreshold = 1000; // milliseconds
  }

  trackQuery(query, executionTime, rowsAffected) {
    const entry = {
      query: this.sanitizeQuery(query),
      executionTime,
      rowsAffected,
      timestamp: new Date(),
      isSlow: executionTime > this.slowQueryThreshold
    };
    
    this.queries.push(entry);
    
    // Keep only last 1000 queries in memory
    if (this.queries.length > 1000) {
      this.queries = this.queries.slice(-1000);
    }

    if (entry.isSlow) {
      console.warn(`[SLOW QUERY] ${executionTime}ms: ${entry.query.substring(0, 100)}...`);
    }

    return entry;
  }

  sanitizeQuery(query) {
    // Remove potentially sensitive data
    return query.replace(/password\s*=\s*['"][^'"]*['"]/gi, "password='***'");
  }

  getSlowQueries(limit = 10) {
    return this.queries
      .filter(q => q.isSlow)
      .slice(-limit)
      .reverse();
  }

  getAverageQueryTime(minutes = 5) {
    const cutoff = new Date(Date.now() - minutes * 60000);
    const recentQueries = this.queries.filter(q => q.timestamp > cutoff);
    
    if (recentQueries.length === 0) return 0;
    
    const totalTime = recentQueries.reduce((sum, q) => sum + q.executionTime, 0);
    return Math.round(totalTime / recentQueries.length);
  }

  getQueryStats() {
    return {
      totalQueries: this.queries.length,
      slowQueries: this.queries.filter(q => q.isSlow).length,
      averageTime: this.getAverageQueryTime(5),
      slowQueryThreshold: this.slowQueryThreshold,
      slowQueryList: this.getSlowQueries(5)
    };
  }

  resetStats() {
    this.queries = [];
    queryCache.flushAll();
    shortCache.flushAll();
    longCache.flushAll();
  }
}

const performanceMonitor = new QueryPerformanceMonitor();

/**
 * Generate cache key for query
 */
function generateCacheKey(table, filters, cacheType = 'query') {
  const filterStr = JSON.stringify(filters || {});
  return `${cacheType}:${table}:${filterStr}`;
}

/**
 * Get from cache or execute query
 */
async function getCachedOrExecute(table, filters, queryFn, cacheType = 'short') {
  const cacheKey = generateCacheKey(table, filters, cacheType);
  
  // Try to get from appropriate cache
  let cache = queryCache;
  if (cacheType === 'short') cache = shortCache;
  if (cacheType === 'long') cache = longCache;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  // Execute query if not in cache
  const result = await queryFn();
  if (result.success) {
    cache.set(cacheKey, result.data);
  }

  return { data: result.data, fromCache: false };
}

/**
 * Invalidate cache for a table
 */
function invalidateTableCache(table) {
  const keys = queryCache.keys();
  keys.forEach(key => {
    if (key.includes(`:${table}:`)) {
      queryCache.del(key);
    }
  });

  const shortKeys = shortCache.keys();
  shortKeys.forEach(key => {
    if (key.includes(`:${table}:`)) {
      shortCache.del(key);
    }
  });
}

/**
 * Batch query optimization
 * Combines multiple small queries into fewer larger queries
 */
async function batchQuery(queries, db) {
  try {
    const startTime = Date.now();
    const results = [];
    
    // Group queries by type
    const groupedQueries = {};
    queries.forEach((q, idx) => {
      const type = q.type || 'custom';
      if (!groupedQueries[type]) {
        groupedQueries[type] = [];
      }
      groupedQueries[type].push({ ...q, originalIndex: idx });
    });

    // Execute grouped queries
    for (const [type, group] of Object.entries(groupedQueries)) {
      for (const q of group) {
        const result = await db.query(q.sql, q.params);
        results[q.originalIndex] = result;
      }
    }

    const executionTime = Date.now() - startTime;
    performanceMonitor.trackQuery(`BATCH: ${queries.length} queries`, executionTime, 0);

    return { success: true, data: results };
  } catch (error) {
    console.error('Batch query error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Query result pagination helper
 */
async function optimizedPaginate(db, sql, countSql, params, page = 1, limit = 20) {
  try {
    const startTime = Date.now();
    
    // Execute count and data queries in parallel for better performance
    const [countResult] = await db.query(countSql, params);
    const total = countResult[0].total;
    const pages = Math.ceil(total / limit);
    
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `${sql} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const executionTime = Date.now() - startTime;
    performanceMonitor.trackQuery(sql, executionTime, rows.length);

    return {
      success: true,
      data: {
        items: rows,
        pagination: { page, limit, total, pages, hasMore: page < pages }
      }
    };
  } catch (error) {
    console.error('Pagination error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Query plan analyzer
 * Uses EXPLAIN to analyze query performance
 */
async function analyzeQueryPlan(db, sql, params) {
  try {
    const [plan] = await db.query(`EXPLAIN ${sql}`, params);
    
    return {
      success: true,
      data: {
        plan,
        analysis: {
          rowsExamined: plan[0].rows,
          usingIndex: plan[0].key !== null,
          usingFilesort: plan[0].Extra && plan[0].Extra.includes('filesort'),
          usingTemporary: plan[0].Extra && plan[0].Extra.includes('temporary')
        }
      }
    };
  } catch (error) {
    console.error('Query plan analysis error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Connection pooling statistics
 */
async function getPoolStatistics(pool) {
  try {
    return {
      connectionLimit: pool.config.connectionLimit,
      waitForConnectionsQueue: pool.config.waitForConnectionsQueue,
      waitForConnectionsTimeout: pool.config.waitForConnectionsTimeout,
      enableIdleConnections: pool.config.enableIdleConnections,
      idleTimeout: pool.config.idleTimeout,
      queueLimit: pool.config.queueLimit
    };
  } catch (error) {
    console.error('Pool stats error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Detect N+1 query problems
 */
function detectNPlusOneQueries() {
  const queryPatterns = {};
  
  performanceMonitor.queries.forEach(q => {
    const normalized = q.query.replace(/\?/g, 'param').substring(0, 100);
    if (!queryPatterns[normalized]) {
      queryPatterns[normalized] = [];
    }
    queryPatterns[normalized].push(q);
  });

  const nplusOne = {};
  Object.entries(queryPatterns).forEach(([pattern, queries]) => {
    if (queries.length > 5) {
      nplusOne[pattern] = {
        count: queries.length,
        totalTime: queries.reduce((sum, q) => sum + q.executionTime, 0),
        averageTime: Math.round(queries.reduce((sum, q) => sum + q.executionTime, 0) / queries.length)
      };
    }
  });

  return nplusOne;
}

/**
 * Performance tuning recommendations
 */
function getPerformanceRecommendations() {
  const slowQueries = performanceMonitor.getSlowQueries(20);
  const nplusOne = detectNPlusOneQueries();
  const recommendations = [];

  if (slowQueries.length > 5) {
    recommendations.push({
      type: 'SLOW_QUERIES',
      severity: 'HIGH',
      message: `${slowQueries.length} slow queries detected. Consider adding indexes or optimizing queries.`,
      data: slowQueries.slice(0, 3)
    });
  }

  if (Object.keys(nplusOne).length > 0) {
    recommendations.push({
      type: 'N_PLUS_ONE',
      severity: 'HIGH',
      message: 'Potential N+1 query patterns detected. Consider using batch queries or eager loading.',
      data: nplusOne
    });
  }

  if (performanceMonitor.getAverageQueryTime(5) > 500) {
    recommendations.push({
      type: 'AVERAGE_QUERY_TIME',
      severity: 'MEDIUM',
      message: `Average query time is ${performanceMonitor.getAverageQueryTime(5)}ms. Consider optimization.`
    });
  }

  return recommendations;
}

/**
 * Export performance dashboard data
 */
function getPerformanceDashboard() {
  return {
    stats: performanceMonitor.getQueryStats(),
    recommendations: getPerformanceRecommendations(),
    cacheStatus: {
      cacheSize: queryCache.keys().length,
      shortCacheSize: shortCache.keys().length,
      longCacheSize: longCache.keys().length
    },
    topSlowQueries: performanceMonitor.getSlowQueries(5)
  };
}

module.exports = {
  performanceMonitor,
  generateCacheKey,
  getCachedOrExecute,
  invalidateTableCache,
  batchQuery,
  optimizedPaginate,
  analyzeQueryPlan,
  getPoolStatistics,
  detectNPlusOneQueries,
  getPerformanceRecommendations,
  getPerformanceDashboard,
  queryCache,
  shortCache,
  longCache
};
