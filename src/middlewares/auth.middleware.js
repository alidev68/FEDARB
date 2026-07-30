const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma"); // Change path if needed

const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const auth = asyncHandler(async (req, res, next) => {
    // Get token from cookie or Authorization header
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Access token is required");
    }

    // Verify token
    const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
    );

    //Find user
    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id
        },
        select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            coverImageUrl: true,
            createdAt: true
        }
    });

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    // Attach user to request
    req.user = user;

    next();
});

module.exports = auth;