const { Router } = require("express");
const Validator = require("../middlewares/validator");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
} = require("../controllers/product.controller");

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", Validator("createProduct"), createProduct);
router.put("/:id", Validator("updateProduct"), updateProductById);
router.delete("/:id", deleteProductById);

module.exports = router;
