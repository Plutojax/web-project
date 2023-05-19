/**
 * The insertSightingRow function from insert_form_controller module is specified for this route.
 * */
const express = require('express');

const router = express.Router();
const { UploadSighting } = require('../controllers/api/insert_form_controller');

router.post('/', UploadSighting);
module.exports = router;
