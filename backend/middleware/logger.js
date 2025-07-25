const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);

  // Log user info if available
  if (req.user) {
    console.log(`  User: ${req.user.name} (${req.user.role})`);
  }

  // Log request body for POST/PUT requests
  if (req.method === "POST" || req.method === "PUT") {
    console.log("  Body:", JSON.stringify(req.body, null, 2));
  }

  next();
};

module.exports = { requestLogger };
