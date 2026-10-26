const express = require('express');
const router = express.Router();
const { myParticipations, updateParticipation, listByProgram } = require('../controllers/participationController');
const { protect } = require('../middleware/auth');

router.get('/mine', protect, myParticipations);
router.get('/', protect, listByProgram);
router.put('/:id', protect, updateParticipation);

module.exports = router;
