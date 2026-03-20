const pool = require('../db/db');
const { normalizeLog } = require('../utils/normalizer');

exports.ingestLog = async (req, res) => {
    try {

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'No log data provided' });
        }
        const rawLog = req.body;
        
        const normalizedData = normalizeLog(rawLog);



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
            normalizedData.raw
        ];

        await pool.execute(query, values);
        res.status(202).json({ message: 'Log ingested and normalized' });
        console.log(`Log ingested: tenant=${normalizedData.tenant}, source=${normalizedData.source}, event_type=${normalizedData.event_type}`);
    } catch (error) {
        console.error("Full Error: " + error);
        res.status(500).json({ error: 'Ingestion failed' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const { tenant, source } = req.query;
        let sql = 'SELECT * FROM logs WHERE 1=1';
        const params = [];

        if (tenant) {
            sql += ' AND tenant = ?';
            params.push(tenant);
        }
        
        if (source) {
            sql += ' AND source = ?';
            params.push(source);
        }

        sql += ' ORDER BY at_timestamp DESC LIMIT 100';

        // เรียกใช้งานฐานข้อมูล [cite: 5]
        const [rows] = await pool.execute(sql, params);
        
        res.status(200).json(rows);
        console.log(`Fetched ${rows.length} logs for tenant=${tenant || 'all'} and source=${source || 'all'}`);
    } catch (error) {
        console.error("❌ Query Error:", error);
        res.status(500).json({ error: 'Query failed', details: error.message });
    }
};