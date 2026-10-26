const express = require('express');
const router = express.Router();
const { myApplications, listApplications, updateApplication, apply } = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.get('/mine', protect, myApplications);
router.get('/', protect, listApplications);
router.put('/:id', protect, updateApplication);
router.post('/:id/apply', protect, apply);

module.exports = router;
