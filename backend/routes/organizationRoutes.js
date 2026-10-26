const express = require('express');
const router = express.Router();
const {
  listOrganizations,
  getOrganization,
  updateOrganization,
  verifyOrganization,
  createExternalOrganization,
  deleteOrganization,
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listOrganizations);
router.post('/', protect, authorize('admin'), createExternalOrganization);
router.get('/:id', getOrganization);
router.put('/:id', protect, updateOrganization);
router.delete('/:id', protect, deleteOrganization);
router.post('/:id/verify', protect, authorize('admin'), verifyOrganization);

module.exports = router;
