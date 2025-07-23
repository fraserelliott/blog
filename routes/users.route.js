const router = require("express").Router();
const { User } = require("../models/index.model");
const { FailSchema, StringField } = require("@fraserelliott/fail");
const inputValidation = require("../middleware/inputvalidation.middleware");
const bcrypt = require("bcrypt");

// Define validation rules for user registration inputs
const userSchema = new FailSchema();
userSchema.add("email", new StringField().required().email().maxLength(255));
// regex checks for at least one special character from this set !@#$%^&*(),.?":{}|<>_-[]=/+;'/`~\
// TODO: update FAIL to include .password(minStrength) in StringField
userSchema.add("password", new StringField()
    .required()
    .minLength(8)
    .maxLength(20)
    .regex(/[!@#$%^&*(),.?":{}|<>_\-\\[\]=+;'/`~\/]/));
userSchema.add("name", new StringField().required().maxLength(255));

// Route to create a new user after validating the input
router.post("/", inputValidation.validate(userSchema), async (req, res) => {
    try {
        const saltRounds = 10;
        const { email, name, password } = req.body;
        const pwhash = await bcrypt.hash(password, saltRounds);
        const user = await User.create({ email, name, pwhash });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email
        }); // Don't return pwhash
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ error: "Email already in use" });
        }

        console.error(error);
        res.status(500).json({ error: "Error creating user" });
    }
});

module.exports = router;