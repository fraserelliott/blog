const router = require("express").Router();

const userRoutes = require("./users.route");
const authRoutes = require("./auth.route");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;