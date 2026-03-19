/**
 * ฟังก์ชันหลักสำหรับแปลง Log จากแหล่งต่างๆ ให้เข้าสู่ Schema กลาง [cite: 33, 34]
 */
exports.normalizeLog = (rawData) => {
    // 1. กำหนดโครงสร้างพื้นฐาน (Default Schema) [cite: 35, 36]
    let normalized = {
        at_timestamp: rawData['@timestamp'] || new Date().toISOString(),
        tenant: rawData.tenant || 'unknown',
        source: rawData.source || 'api',
        severity: parseInt(rawData.severity) || 0,
        event_type: rawData.event_type || 'generic_event',
        src_ip: rawData.ip || rawData.src_ip || null,
        user: rawData.user || null,
        host: rawData.host || null,
        raw: JSON.stringify(rawData) // เก็บข้อมูลดิบไว้ตามเงื่อนไข [cite: 40]
    };

    // 2. แยก Logic ตาม Source [cite: 18]
    switch (normalized.source) {
        case 'firewall':
            // ตัวอย่าง: <134>Aug 20 12:44:56 fw01 ... action=deny src=10.0.1.10 [cite: 45]
            // ในเคสนี้ถ้าส่งเป็น String ต้องใช้ Regex หรือ Parser
            if (typeof rawData.message === 'string') {
                normalized.event_type = 'network_traffic';
                normalized.src_ip = extractField(rawData.message, 'src=');
                normalized.severity = rawData.message.includes('deny') ? 5 : 1;
            }
            break;

        case 'aws':
            // จัดการโครงสร้าง Nested ของ AWS CloudTrail [cite: 74, 78]
            if (rawData.cloud) {
                normalized.event_type = rawData.event_type || 'aws_api_call';
                normalized.user = rawData.user || 'system';
                // ดึงข้อมูล Cloud specific เข้าไปใน tags หรือฟิลด์เสริม
                normalized.tags = [`region:${rawData.cloud.region}`, `service:${rawData.cloud.service}`];
            }
            break;

        case 'ad':
            // จัดการ Microsoft AD Event ID 4625 (Logon Failed) [cite: 95, 96]
            normalized.event_type = rawData.event_id === 4625 ? 'LogonFailed' : rawData.event_type;
            normalized.severity = rawData.event_id === 4625 ? 7 : 3; 
            normalized.src_ip = rawData.ip;
            break;

        case 'crowdstrike':
            // จัดการข้อมูลจาก CrowdStrike [cite: 63, 66]
            normalized.severity = rawData.severity || 8; // ปกติ CrowdStrike มักจะสูง
            normalized.host = rawData.host;
            break;
    }

    return normalized;
};

// ฟังก์ชันช่วยดึงข้อมูลจาก String (กรณีเป็น Syslog Raw Text)
function extractField(str, fieldName) {
    const regex = new RegExp(`${fieldName}([^\\s$]+)`);
    const match = str.match(regex);
    return match ? match[1] : null;
}