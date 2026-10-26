const express = require('express');
const router = express.Router();
const { listUsers, getUser, updateProfile, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), listUsers);
router.put('/profile', protect, updateProfile);
router.get('/:id', protect, authorize('admin'), getUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
