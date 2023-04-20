const { Router } = require("express");
const Validator = require("../middlewares/validator");
const UserPolice = require("../middlewares/userPolice");

const {
  signUp,
  signIn,
  logout,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/user.controller");

const router = Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/signup", Validator("signup"), signUp);
router.post("/signin", Validator("login"), signIn);
router.post("/logout", logout);
router.put("/:id", UserPolice, Validator("update"), updateUserById);
router.delete("/:id", UserPolice, deleteUserById);

module.exports = router;
