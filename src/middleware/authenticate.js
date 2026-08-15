import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const token = authorization.substring(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.AUTH_SECRET
    );

    req.auth = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      email: payload.email,
    };

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}