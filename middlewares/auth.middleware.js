// A simple check that blocks access to admin routes unless the right key is provided
// To use an admin route in development, I will add this header to my request: x-admin-key: admin123


export const adminAuth = (req, res, next) => {
  const key = req.headers["x-admin-key"];

  if (!key || key !== (process.env.ADMIN_KEY || "admin123")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Add the x-admin-key header to access this route.",
    });
  }

  next(); // key is correct, let the request through
};