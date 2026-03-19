const pool = require('../db/db'); // ไฟล์เชื่อมต่อ MySQL
const { normalizeLog } = require('../utils/normalizer');

exports.ingestLog = async (req, res) => {
    try {
        const rawLog = req.body;
        
        // แปลงข้อมูลจากแหล่งต่างๆ (AWS, API, M365) เข้า Schema กลาง [cite: 20, 33]
        const normalizedData = normalizeLog(rawLog);

        const query = `
            INSERT INTO logs (
                at_timestamp, tenant, source, severity, event_type,
                src_ip, user, raw_data
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
            JSON.stringify(rawLog) // เก็บ raw ไว้ตามโจทย์ [cite: 40]
        ];

        await pool.execute(query, values);
        res.status(202).json({ message: 'Log ingested and normalized' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ingestion failed' });
    }
};

exports.getLogs = async (req, res) => {
    // ดึงข้อมูลตาม Tenant และเงื่อนไข Filter [cite: 23, 125]
    const { tenant, source, severity } = req.query;
    // Logic การ Query MySQL พร้อมเงื่อนไข WHERE tenant = ?
};