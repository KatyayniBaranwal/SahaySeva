const express = require('express');
const router = express.Router();
const {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
  toggleSave,
  listSaved,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listServices);
router.get('/saved', protect, listSaved);
router.post('/', protect, authorize('provider'), createService);
router.put('/:id/save', protect, toggleSave);
router.get('/:id', getService);
router.put('/:id', protect, authorize('provider'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;
