const express = require("express");
const router = express.Router();
const authController = require("../Controllers/auth");
const authMiddleware = require("../Middleware/auth");

router.post("/login", authController.loginHandler);
router.post(
  "/register",
  authMiddleware.tokenValidator,
  authMiddleware.adminChecker,
  authController.handleRegister
);

router.get(
  "/users",
  authMiddleware.tokenValidator,
  authMiddleware.adminChecker,
  authController.getAllAccounts
);

router.patch(
  "/change-username",
  authMiddleware.tokenValidator,
  authController.changeUsernameHandler
);

router.delete(
  "/delete-users/:id",
  authMiddleware.tokenValidator,
  authMiddleware.adminChecker,
  authController.deleteUserHandler
);

module.exports = router;
