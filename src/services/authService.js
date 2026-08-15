import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { findUserByEmail } from "../repositories/authRepository.js";

export async function loginUser({
  email,
  password,
}) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordValid) {
    return null;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      tenantId: user.tenant_id,
      email: user.email,
    },
    process.env.AUTH_SECRET,
    {
      expiresIn: "2h",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name,
    },
  };
}