const Product = require("../models/Product.model");
const ApiError = require("../errors/ApiError");
const mongoose = require("mongoose");

const createProduct = async (req, res) => {
  try {
    const { title, price, description } = req.body;

    const product = await Product({
      title,
      price,
      description,
    });

    await product.save();

    res.status(200).send(product);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).send(products);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(`${id}`)) {
      return res.status(400).send({ message: "Canceled, Invalid ID sent" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send({ message: "Product does not exist" });
    }

    res.status(200).send(product);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(`${id}`)) {
      return res.status(400).send({ message: "Canceled, Invalid ID sent" });
    }

    const { title, price, description } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      { title, price, description },
      { new: true }
    );

    res.status(200).send({ message: "Updated", product: updatedProduct });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(`${id}`)) {
      return res.status(400).send({ message: "Canceled, Invalid ID sent" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(400).send({ message: "Product was not found" });
    }

    res.status(200).send({ message: "Deleted", product: deletedProduct });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
