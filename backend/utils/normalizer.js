exports.normalizeLog = (rawData) => {
    if (!rawData || typeof rawData !== 'object') {
        throw new Error('Invalid log data');
    }
    
    let normalized = {
        // แก้ไขเป็น new Date() และใช้ .slice() ให้ถูกต้อง 
        at_timestamp: rawData['@timestamp']
            ? new Date(rawData['@timestamp']).toISOString().slice(0, 19).replace('T', ' ')
            : new Date().toISOString().slice(0, 19).replace('T', ' '),
        tenant: rawData.tenant || 'unknown',
        source: rawData.source || 'api',
        severity: parseInt(rawData.severity) || 0,
        event_type: rawData.event_type || 'generic_event',
        src_ip: rawData.ip || rawData.src_ip || null,
        user: rawData.user || null,
        host: rawData.host || null,
        // ลบเครื่องหมาย / ออก 
        raw: JSON.stringify(rawData) 
    };

    switch (normalized.source) {
        case 'firewall': // [cite: 142, 175]
            if (typeof rawData.message === 'string') {
                normalized.event_type = 'network_traffic';
                normalized.src_ip = extractField(rawData.message, 'src=');
                normalized.severity = rawData.message.includes('deny') ? 5 : 1;
            }
            break;

        case 'aws': // [cite: 145, 203]
            if (rawData.cloud) {
                normalized.event_type = rawData.event_type || 'aws_api_call';
                normalized.user = rawData.user || 'system';
                normalized.host = rawData.cloud.account_id;
            }
            break;

        case 'm365': // [cite: 146, 212]
            normalized.event_type = rawData.event_type || 'm365_audit';
            normalized.user = rawData.user;
            normalized.src_ip = rawData.ip;
            break;

        case 'ad': // [cite: 147, 224]
            normalized.event_type = rawData.event_id === 4625 ? 'LogonFailed' : rawData.event_type;
            normalized.severity = rawData.event_id === 4625 ? 7 : 3;
            normalized.src_ip = rawData.ip;
            break;

        case 'crowdstrike': // [cite: 144, 192]
            normalized.severity = rawData.severity || 8;
            normalized.host = rawData.host;
            break;
    }

    return normalized;
};

function extractField(str, fieldName) {
    const regex = new RegExp(`${fieldName}([^\\s$]+)`);
    const match = str.match(regex);
    return match ? match[1] : null;
}