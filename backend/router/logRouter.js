const express = require('express');
const router = express.Router();

const {getLogs,ingestLog} = require('../controller/logController');


router.get('/getLogs', getLogs);
router.post('/ingestLog', ingestLog);


module.exports = router;
