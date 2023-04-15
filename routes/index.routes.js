const { Router } = require("express");
const router = Router();

const userRouter = require("./user.routes");

router.use("/api/user", userRouter);

module.exports = router;
