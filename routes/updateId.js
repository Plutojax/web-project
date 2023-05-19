/**
 * The insertSightingRow function from insert_form_controller module is specified for this route.
 * */
const express = require('express');

const router = express.Router();
const { updateId } = require('../controllers/api/update_id');

router.post('/', updateId);
module.exports = router;
