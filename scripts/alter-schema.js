const { sequelize } = require("../config/connection");
require("../models/index.model");

sequelize.sync({ alter: true, logging: console.log }).then(() => {
  console.log("Schema updated to match models.");
  process.exit();
});