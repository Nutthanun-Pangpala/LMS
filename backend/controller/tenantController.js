const pool = require('../db/db');

// GET /api/tenants — รายการ tenant ทั้งหมด + stats จาก logs
exports.getTenants = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        t.id,
        t.name,
        t.description,
        t.status,
        t.created_at,
        COUNT(l.id)                                      AS log_count,
        SUM(l.severity >= 4)                             AS error_count,
        SUM(l.severity = 3)                              AS warning_count,
        MAX(l.at_timestamp)                              AS last_seen
      FROM tenants t
      LEFT JOIN logs l ON l.tenant = t.name
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ getTenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants', details: error.message });
  }
};

// POST /api/tenants — สร้าง tenant ใหม่
exports.createTenant = async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const [[exists]] = await pool.execute('SELECT id FROM tenants WHERE name = ?', [name]);
    if (exists) return res.status(409).json({ error: 'Tenant name already exists' });

    const [result] = await pool.execute(
      'INSERT INTO tenants (name, description, status) VALUES (?, ?, ?)',
      [name.trim(), description.trim(), 'active']
    );
    const [[created]] = await pool.execute('SELECT * FROM tenants WHERE id = ?', [result.insertId]);
    res.status(201).json(created);
  } catch (error) {
    console.error('❌ createTenant:', error);
    res.status(500).json({ error: 'Failed to create tenant', details: error.message });
  }
};

// PUT /api/tenants/:id — แก้ไข tenant
exports.updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const [[exists]] = await pool.execute('SELECT id FROM tenants WHERE id = ?', [id]);
    if (!exists) return res.status(404).json({ error: 'Tenant not found' });

    await pool.execute(
      'UPDATE tenants SET name = ?, description = ?, status = ? WHERE id = ?',
      [name, description, status, id]
    );
    const [[updated]] = await pool.execute('SELECT * FROM tenants WHERE id = ?', [id]);
    res.status(200).json(updated);
  } catch (error) {
    console.error('❌ updateTenant:', error);
    res.status(500).json({ error: 'Failed to update tenant', details: error.message });
  }
};

// DELETE /api/tenants/:id — ลบ tenant
exports.deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const [[exists]] = await pool.execute('SELECT id FROM tenants WHERE id = ?', [id]);
    if (!exists) return res.status(404).json({ error: 'Tenant not found' });

    await pool.execute('DELETE FROM tenants WHERE id = ?', [id]);
    res.status(200).json({ message: 'Tenant deleted' });
  } catch (error) {
    console.error('❌ deleteTenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant', details: error.message });
  }
};