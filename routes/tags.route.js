const router = require("express").Router();
const { Tag } = require("../models/index.model");
const { FailSchema, StringField } = require("@fraserelliott/fail");
const inputValidation = require("../middleware/inputvalidation.middleware");



module.exports = router;