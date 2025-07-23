const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { FailSchema, StringField } = require('@fraserelliott/fail');
const inputValidation = require("../middleware/inputvalidation.middleware");
const { User } = require("../models/index.model");

const userSchema = new FailSchema();
userSchema.add("email", new StringField().required().email());
userSchema.add("password", new StringField().required());

router.post("/", inputValidation.validate(userSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email }});
        if (!user)
            return rejectInvalidCredentials(res);

        const match = await bcrypt.compare(password, user.pwhash);
        if (!match)
            return rejectInvalidCredentials(res);

        const payload = { "id": user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        res.status(200).json({
            token,
            email: user.email,
            id: user.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error adding post" });
    }
});

function rejectInvalidCredentials(res) {
    return res.status(401).json({ error: "Invalid username or password. "});
}

module.exports = router;