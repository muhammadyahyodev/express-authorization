const { Router } = require("express");
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
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logout);
router.patch("/:id", updateUserById);
router.delete("/:id", deleteUserById);

module.exports = router;
