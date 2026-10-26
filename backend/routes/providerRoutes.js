const express = require('express');
const router = express.Router();
const { listProviders, getProvider, getMyProfile, updateMyProfile } = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listProviders);
router.get('/me/profile', protect, authorize('provider'), getMyProfile);
router.put('/me/profile', protect, authorize('provider'), updateMyProfile);
router.get('/:id', getProvider);

module.exports = router;
