const authService = require("../services/auth.service");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");

const signUp = asyncHandler(async (req, res) => {
  const result = await authService.signUp(req.body);

  return res.status(201).json(
    new ApiResponse(
      201,
      result,
      "User registered successfully."
    )
  );
});



const signIn = asyncHandler(async (req, res) => {
  const result = await authService.signIn(req.body);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "User signed in successfully."
    )
  );
});


const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Password reset request processed successfully."
    )
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Password has been reset successfully."
    )
  );
});

module.exports = {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  
};