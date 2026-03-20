const pool = require('../db/db');
const { normalizeLog } = require('../utils/normalizer');

exports.ingestLog = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No log data provided' });
    }

    const normalizedData = normalizeLog(req.body);

    const query = `
      INSERT INTO logs (
        at_timestamp, tenant, source, severity, event_type,
        src_ip, user, raw
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      normalizedData.at_timestamp,
      normalizedData.tenant,
      normalizedData.source,
      normalizedData.severity || 0,
      normalizedData.event_type,
      normalizedData.src_ip,
      normalizedData.user,
      normalizedData.raw,
    ];

    await pool.execute(query, values);

    console.log(`Log ingested — tenant=${normalizedData.tenant} source=${normalizedData.source} event_type=${normalizedData.event_type}`);
    res.status(202).json({ message: 'Log ingested and normalized' });

  } catch (error) {
    console.error('❌ Ingest Error:', error);
    res.status(500).json({ error: 'Ingestion failed' });
  }
};

// Whitelist columns เพื่อป้องกัน SQL injection ใน ORDER BY
const SORTABLE_COLUMNS = new Set([
  'at_timestamp', 'tenant', 'source', 'severity', 'event_type', 'src_ip', 'user',
]);
const SORT_DIRECTIONS = new Set(['ASC', 'DESC']);

exports.getLogs = async (req, res) => {
  try {
    const {
      tenant,
      source,
      severity,
      search,
      from,
      to,
      sortBy  = 'at_timestamp',
      sortDir = 'DESC',
    } = req.query;

    // --- Pagination ---
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // --- Sanitize sort (whitelist เท่านั้น) ---
    const safeSort = SORTABLE_COLUMNS.has(sortBy)              ? sortBy              : 'at_timestamp';
    const safeDir  = SORT_DIRECTIONS.has((sortDir || '').toUpperCase()) ? sortDir.toUpperCase() : 'DESC';

    // --- Build WHERE dynamically ---
    const conditions  = ['1=1'];
    const params      = [];
    const countParams = [];

    const add = (sql, ...values) => {
      conditions.push(sql);
      params.push(...values);
      countParams.push(...values);
    };

    if (tenant)   add('tenant = ?',   tenant);
    if (source)   add('source = ?',   source);
    if (severity) add('severity = ?', severity);

    if (search) {
      add(
        '(tenant LIKE ? OR source LIKE ? OR event_type LIKE ? OR raw LIKE ?)',
        `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`
      );
    }

    if (from) add('at_timestamp >= ?', new Date(from).toISOString());
    if (to)   add('at_timestamp <= ?', new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString());

    const where = ' WHERE ' + conditions.join(' AND ');

    // --- Count total ---
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM logs${where}`,
      countParams
    );

    // --- Fetch page ---
    const [rows] = await pool.execute(
      `SELECT * FROM logs${where} ORDER BY ${safeSort} ${safeDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    console.log(
      `getLogs page=${page}/${Math.ceil(total / limit)} rows=${rows.length}/${total} ` +
      `tenant=${tenant || 'all'} source=${source || 'all'} severity=${severity || 'all'} ` +
      `search="${search || ''}" from=${from || '-'} to=${to || '-'} sort=${safeSort} ${safeDir}`
    );

    res.status(200).json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('❌ getLogs Error:', error);
    res.status(500).json({ error: 'Query failed', details: error.message });
  }
};