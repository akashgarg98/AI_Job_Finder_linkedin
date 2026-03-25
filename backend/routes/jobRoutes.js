const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.post('/jobs/scrape', jobController.scrapeJobs);
router.post('/resume/score', jobController.scoreResume);

module.exports = router;
