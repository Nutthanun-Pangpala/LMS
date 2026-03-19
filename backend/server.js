// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logRoutes = require('./router/logRouter');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});