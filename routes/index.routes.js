const { Router } = require("express");
const router = Router();

const userRouter = require("./user.routes");
const productRouter = require("./product.routes");

router.use("/user", userRouter);
router.use("/product", productRouter);

module.exports = router;
