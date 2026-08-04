const crypto = require("crypto");
const RESET_TOKEN_BYTES = require("../constants/auth.constants").RESET_TOKEN_BYTES;
const authRepository = require("../repositories/auth.repository");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateAccessToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");
const { buildJwtPayload } = require("../utils/auth");

const signUp = async (payload) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
  } = payload;

  // Check if user already exists
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email.");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await authRepository.createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phoneNumber,
    role,
  });

  // Generate JWT
  const accessToken = generateAccessToken(buildJwtPayload(user));

  // Remove password before returning
  delete user.password;

  return {
    user,
    accessToken,
  };
};



const signIn = async (payload) => {
  const { email, password } = payload;

  // Check if user exists
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Compare password
  const isPasswordValid = await comparePassword(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Check if account is active
  if (!user.isActive) {
    throw new ApiError(403, "Account is inactive.");
  }

  // Generate JWT
  const accessToken = generateAccessToken(buildJwtPayload(user));

  // Remove password
  const { password: _, ...userData } = user;

  return {
    user: userData,
    accessToken,
  };
};


const forgotPassword = async (payload) => {
  const { email } = payload;

  // Find user by email
  const user = await authRepository.findUserByEmail(email);

  // Do not reveal whether the email exists
  if (!user) {
    return {
      message:
        "If an account with this email exists, a password reset link has been generated.",
    };
  }

  // Delete any previous reset tokens
  await authRepository.deleteUserResetTokens(user.id);

  // Generate secure random token
  const resetToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");

  // Hash the token before storing it
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token expires in 15 minutes
 const expiresAt = new Date(
  Date.now() +
  Number(process.env.PASSWORD_RESET_EXPIRES_IN) * 60 * 1000
);

  // Save hashed token in database
  await authRepository.createPasswordResetToken({
    token: hashedToken,
    userId: user.id,
    expiresAt,
  });

  // TODO: Replace this with email sending later
  return {
    message:
      "If an account with this email exists, a password reset link has been generated.",

    // Return only for development/testing.
    resetToken,
  };
};

const resetPassword = async (payload) => {
  const { token, password } = payload;

  // Hash incoming token
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find token in database
  const resetTokenRecord = await authRepository.findPasswordResetToken(
    hashedToken
  );

  if (!resetTokenRecord) {
    throw new ApiError(400, "Invalid or expired reset token.");
  }

  // Check expiry
  if (resetTokenRecord.expiresAt < new Date()) {
    await authRepository.deletePasswordResetToken(resetTokenRecord.id);

    throw new ApiError(400, "Reset token has expired.");
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update user's password
  await authRepository.updateUserPassword(
    resetTokenRecord.userId,
    hashedPassword
  );

  // Delete used token
  await authRepository.deletePasswordResetToken(resetTokenRecord.id);

  return {
    message: "Password reset successfully.",
  };
};

module.exports = {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
};