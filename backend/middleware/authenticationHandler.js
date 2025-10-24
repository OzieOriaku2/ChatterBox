const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel"); 

const { JWT_SECRET_KEY } = require("../constants"); 

const auth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token); 

      const decodedToken = jwt.verify(token, JWT_SECRET_KEY);

      req.user = await User.findById(decodedToken.id).select('-password'); 
      
      if (!req.user) {
        console.log("User not found");
        res.status(401);
        throw new Error("Not authorized");
      }

      next();
    } catch (err) {
      console.log("Auth middleware error:", err.message);
      res.status(401).json({
        message: "Not authorized - invalid or expired token",
      });
    }
  } else {
    console.log("No token found in headers");
    res.status(401).json({
      message: "Not authorized - token required",
    });
  }
});

// Optional: For future admin roles (not in assignment, but easy add)
const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) { // Assuming you'd add isAdmin to User model later
    next();
  } else {
    res.status(403).json({
      message: "Not authorized - admin access required",
    });
  }
});

module.exports = { auth, isAdmin };