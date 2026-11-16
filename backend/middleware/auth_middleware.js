const jwt = require("jsonwebtoken");

/**
 Accepts the JWT from the auth_token cookie or an Authorization: Bearer header.
 On success, sets req.user to { id } for downstream route handlers.
 */

function authMiddleware(req, res, next) {
  const authorization = req.headers["authorization"];
  const token = authorization && authorization.split(" ")[1]

  // If no token is found, return 401 Unauthorized
  if (!token) {return res.status(401).json({ message: "Unauthorized" });}

  // Verify the token
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  }); 


}

module.exports = authMiddleware;
