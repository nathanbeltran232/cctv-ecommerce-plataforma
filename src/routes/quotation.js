const express = require('express');
const router = express.Router();
const { calculateQuote } = require('../controllers/quotationController');

router.post('/calculate', calculateQuote);

module.exports = router;