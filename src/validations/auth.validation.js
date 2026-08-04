const Joi = require("joi");

const signUpSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),

  lastName: Joi.string().trim().min(2).max(50).required(),

  email: Joi.string().email().trim().lowercase().required(),

  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]+$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number and special character.",
    }),

  phoneNumber: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]+$/)
    .allow(null, ""),

  role: Joi.string()
    .valid(
      "ADMIN",
      "CASE_MANAGER",
      "ARBITRATOR",
      "MEDIATOR",
      "CLIENT"
    )
    .optional(),
});

const signInSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),

  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),

  password: Joi.string()
    .min(8)
    .max(32)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]+$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number and special character.",
    }),
});

module.exports = {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};