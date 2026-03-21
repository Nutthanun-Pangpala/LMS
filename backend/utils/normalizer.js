const SEVERITY_MAP = {
  critical: 5,
  error:    4,
  warning:  3,
  info:     2,
  debug:    1,
  success:  0,
};

const toSeverityInt = (val) => {
  if (val === null || val === undefined || val === '') return 2;
  if (typeof val === 'number' && !isNaN(val)) return val;
  const key = String(val).toLowerCase().trim();
  return SEVERITY_MAP[key] ?? parseInt(val) ?? 2;
};

exports.normalizeLog = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid log data');
  }

  let normalized = {
    at_timestamp: rawData['@timestamp']
      ? new Date(rawData['@timestamp']).toISOString().slice(0, 19).replace('T', ' ')
      : new Date().toISOString().slice(0, 19).replace('T', ' '),
    tenant:     rawData.tenant     || 'unknown',
    source:     rawData.source     || 'api',
    severity:   toSeverityInt(rawData.severity),
    event_type: rawData.event_type || 'generic_event',
    src_ip:     rawData.ip || rawData.src_ip || null,
    user:       rawData.user  || null,
    host:       rawData.host  || null,
    raw:        JSON.stringify(rawData),
  };

  switch (normalized.source) {
    case 'firewall':
      if (typeof rawData.raw === 'string') {
        const msg = rawData.raw;
        if (!rawData.event_type) normalized.event_type = 'network_traffic';
        if (!rawData.src_ip && !rawData.ip) normalized.src_ip = extractField(msg, 'src=');
        if (!rawData.severity) {
          normalized.severity = msg.includes('deny') || msg.includes('drop') || msg.includes('block')
            ? SEVERITY_MAP.warning
            : SEVERITY_MAP.info;
        }
      }
      break;

    case 'aws':
      if (rawData.cloud) {
        normalized.event_type = rawData.event_type || 'aws_api_call';
        normalized.user       = rawData.user || 'system';
        normalized.host       = rawData.cloud.account_id || null;
      }
      break;

    case 'm365':
      normalized.event_type = rawData.event_type || 'm365_audit';
      normalized.user       = rawData.user || null;
      normalized.src_ip     = rawData.ip   || rawData.src_ip || null;
      break;

    case 'ad':
      if (rawData.event_id === 4625) {
        normalized.event_type = 'LogonFailed';
        if (!rawData.severity) normalized.severity = SEVERITY_MAP.error;
      } else {
        normalized.event_type = rawData.event_type || 'ad_event';
        if (!rawData.severity) normalized.severity = SEVERITY_MAP.info;
      }
      normalized.src_ip = rawData.ip || rawData.src_ip || null;
      break;

    case 'crowdstrike':
      normalized.host = rawData.host || null;
      if (typeof rawData.severity === 'number') {
        normalized.severity = rawData.severity >= 8 ? SEVERITY_MAP.critical
          : rawData.severity >= 6 ? SEVERITY_MAP.error
          : rawData.severity >= 4 ? SEVERITY_MAP.warning
          : SEVERITY_MAP.info;
      }
      break;
  }

  return normalized;
};

function extractField(str, fieldName) {
  const regex = new RegExp(`${fieldName}([^\\s$]+)`);
  const match = str.match(regex);
  return match ? match[1] : null;
}