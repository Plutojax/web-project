/**
 * The insertSightingRow function from insert_form_controller module is specified for this route.
 * */
const express = require('express');

const router = express.Router();
const { insertSightingRow } = require('../controllers/api/insert_form_controller');

router.post('/', insertSightingRow);
module.exports = router;
