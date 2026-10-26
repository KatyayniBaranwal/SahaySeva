const express = require('express');
const router = express.Router();
const { dashboard } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, dashboard);

module.exports = router;
