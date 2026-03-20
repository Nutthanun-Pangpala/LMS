const pool = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, password, role, tenant_id } = req.body;
    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password, role, tenant_id) VALUES (?, ?, ?, ?)', 
            [username, hashedPassword, role, tenant_id]);
        res.status(201).json({ message: 'User registered successfully' });
        console.log(`User ${username} registered successfully with role ${role}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user[0].id, role: user[0].role, tenant_id: user[0].tenant_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
        console.log(`User ${username} logged in successfully`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};