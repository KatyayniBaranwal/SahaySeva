const express = require('express');
const router = express.Router();
const {
  verifyCertificate,
  myCertificates,
  listCertificates,
  generateFromApplication,
  generateFromParticipation,
  revokeCertificate,
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

router.get('/verify/:certificateId', verifyCertificate);
router.get('/mine', protect, myCertificates);
router.post('/generate/application', protect, authorize('ngo', 'admin'), generateFromApplication);
router.post('/generate/participation', protect, authorize('college', 'admin'), generateFromParticipation);
router.get('/', protect, listCertificates);
router.put('/:id/revoke', protect, authorize('admin'), revokeCertificate);

module.exports = router;
