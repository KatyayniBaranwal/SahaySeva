const express = require('express');
const router = express.Router();
const {
  listOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listOpportunities);
router.post('/', protect, authorize('ngo'), createOpportunity);
router.get('/:id', getOpportunity);
router.put('/:id', protect, updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);

module.exports = router;
