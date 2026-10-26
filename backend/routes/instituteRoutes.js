const express = require('express');
const router = express.Router();
const {
  listInstitutes,
  getInstitute,
  getMyInstitute,
  updateInstitute,
  verifyInstitute,
  addStudent,
  listStudents,
} = require('../controllers/instituteController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listInstitutes);
router.get('/me/institute', protect, authorize('college'), getMyInstitute);
router.post('/:id/students', protect, authorize('college', 'admin'), addStudent);
router.get('/:id/students', protect, authorize('college', 'admin'), listStudents);
router.get('/:id', getInstitute);
router.put('/:id', protect, updateInstitute);
router.post('/:id/verify', protect, authorize('admin'), verifyInstitute);

module.exports = router;
