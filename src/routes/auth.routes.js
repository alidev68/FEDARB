const express = require("express");

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { 
    signUpSchema,
    signInSchema,
    forgotPasswordSchema,
    resetPasswordSchema
                          } = require("../validations/auth.validation");

const router = express.Router();

router.post(
  "/signup",
  validate(signUpSchema),
  authController.signUp
);


router.post(
  "/signin",
  validate(signInSchema),
  authController.signIn
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);

module.exports = router;