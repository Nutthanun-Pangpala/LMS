const pool = require('../db/db'); // ไฟล์เชื่อมต่อ MySQL
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
    } catch (error) {
        console.error("Full Error: " + error);
        res.status(500).json({ error: 'Ingestion failed' });
    }
};

exports.getLogs = async (req, res) => {
    const { tenant, source, severity } = req.query;
};