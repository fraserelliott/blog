const jwt = require("jsonwebtoken");

exports.validateToken = (req, res, next) => {
    // Expect a header authorization with the form "Bearer: <token>"
    // Adds req.user on success
    if (!req.headers["authorization"])
        return _invalidToken(res);

    const auth = req.headers["authorization"].split(" ");

    if (auth[0] !== "Bearer")
        return _invalidToken(res);

    try {
        const decoded = jwt.verify(auth[1], process.env.JWT_SECRET);
        if (!decoded.id) // bad payload
            _invalidToken(res);

        req.user = decoded;

        next();
    } catch (err) {
        return _invalidToken(res);
    }
}

function _invalidToken(res) {
    return res.status(401).json({
        error: "Action requires authentication."
    });
};