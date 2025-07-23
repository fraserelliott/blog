const { FailSchema } = require("@fraserelliott/fail");

exports.validate = (schema) => {
    return (req, res, next) => {
        const result = schema.validate(req.body);

        if (!result.valid) {
            return res.status(400).json({
                error: result.error || "Invalid input"
            });
        }

        next();
    }
}