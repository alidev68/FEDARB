const prisma = require("../config/prisma");

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },  
  });
};

/**
 * Find user by ID
 */
const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

/**
 * Create a new user
 */
const createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

/**
 * Update user password
 */
const updateUserPassword = async (userId, password) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password,
    },
  });
};

/**
 * Create password reset token
 */
const createPasswordResetToken = async (data) => {
  return prisma.passwordResetToken.create({
    data,
  });
};

/**
 * Find password reset token
 */
const findPasswordResetToken = async (token) => {
  return prisma.passwordResetToken.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });
};

/**
 * Delete password reset token
 */
const deletePasswordResetToken = async (id) => {
  return prisma.passwordResetToken.delete({
    where: {
      id,
    },
  });
};

/**
 * Delete all reset tokens for a user
 */
const deleteUserResetTokens = async (userId) => {
  return prisma.passwordResetToken.deleteMany({
    where: {
      userId,
    },
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPassword,
  createPasswordResetToken,
  findPasswordResetToken,
  deletePasswordResetToken,
  deleteUserResetTokens,
};