const express = require('express');
const router = express.Router();
const { listReviews, myReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/mine', protect, myReviews);
router.get('/', listReviews);
router.post('/', protect, createReview);

module.exports = router;
