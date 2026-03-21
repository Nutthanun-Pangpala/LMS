const express = require('express');
const router = express.Router();

const logController = require('../controller/logController');
const { protect, restrictToTenant, authorize } = require('../utils/authMiddleware');


router.get('/getLogs',protect,restrictToTenant,logController.getLogs);
router.post('/ingestLog',logController.ingestLog);//protect,authorize('admin'),logController.ingestLog);

module.exports = router;
