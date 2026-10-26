const express = require('express');
const router = express.Router();
const {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  updateStatus,
  deleteRequest,
} = require('../controllers/helpRequestController');
const { protect } = require('../middleware/auth');

router.get('/', protect, listRequests);
router.post('/', protect, createRequest);
router.get('/:id', protect, getRequest);
router.put('/:id', protect, updateRequest);
router.put('/:id/status', protect, updateStatus);
router.delete('/:id', protect, deleteRequest);

module.exports = router;
