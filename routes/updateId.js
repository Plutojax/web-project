/**
 * The updateID function from update_id module is specified for this route.
 * */
const express = require('express');

const router = express.Router();
const { updateId } = require('../controllers/api/update_id');

router.post('/', updateId);
module.exports = router;
