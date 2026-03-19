const express = require('express');
const router = express.Router();

const logController = require('../controller/logController');


router.get('/getLogs', logController.getLogs);
router.post('/ingestLog', logController.ingestLog);

module.exports = router;
