const router = require('express').Router();
const { getTenants, createTenant, updateTenant, deleteTenant } = require('../controller/tenantController');
const { protect } = require('../utils/authMiddleware');

router.get('/',      protect, getTenants);
router.post('/',     protect, createTenant);
router.put('/:id',   protect, updateTenant);
router.delete('/:id',protect, deleteTenant);

module.exports = router;