const router = require("express").Router();

const userRoutes = require("./users.route");
const authRoutes = require("./auth.route");
const postRoutes = require("./posts.route");
const tagRoutes = require("./tags.route");
const uploadRoutes = require("./upload.route");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/tags", tagRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;