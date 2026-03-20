// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logRoutes = require('./router/logRout');
const authRoutes = require('./router/authRout');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/logs', logRoutes);

app.use('/api/auth', authRoutes);



const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});