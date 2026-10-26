const express = require('express');
const router = express.Router();
const {
  listPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  joinProgram,
  listParticipants,
} = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listPrograms);
router.post('/', protect, authorize('college'), createProgram);
router.get('/:id', getProgram);
router.put('/:id', protect, updateProgram);
router.delete('/:id', protect, deleteProgram);
router.post('/:id/join', protect, joinProgram);
router.get('/:id/participants', protect, listParticipants);

module.exports = router;
