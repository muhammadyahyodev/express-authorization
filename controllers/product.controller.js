const Product = require("../models/Product.model");
const ApiError = require("../errors/ApiError");
const mongoose = require("mongoose");

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product with the specified details. Requires a JSON object with title, price, and description fields in the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the product
 *               price:
 *                 type: string
 *                 description: The price of the product
 *               description:
 *                 type: string
 *                 description: A description of the product
 *     responses:
 *       200:
 *         description: Product successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the product
 *                 title:
 *                   type: string
 *                   description: The title of the product
 *                 price:
 *                   type: string
 *                   description: The price of the product
 *                 description:
 *                   type: string
 *                   description: A description of the product
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time the product was created
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time the product was last updated
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message indicating what went wrong
 */
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

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Get a list of products
 *     description: Returns a list of all products in the database.
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique ID of the product
 *                   title:
 *                     type: string
 *                     description: The title of the product
 *                   price:
 *                     type: string
 *                     description: The price of the product
 *                   description:
 *                     type: string
 *                     description: A description of the product
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time the product was created
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time the product was last updated
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message indicating what went wrong
 */
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

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Returns the details of a product with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the product
 *                 title:
 *                   type: string
 *                   description: The title of the product
 *                 price:
 *                   type: string
 *                   description: The price of the product
 *                 description:
 *                   type: string
 *                   description: A description of the product
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time the product was created
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date and time the product was last updated
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message indicating what went wrong
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message indicating what went wrong
 */
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

/**
 * @swagger
 *
 * /product/{id}:
 *   put:
 *     summary: Update a product by ID
 *     description: Update a product with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to update.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 614ebe141649c20016447f4c
 *       - in: body
 *         name: body
 *         required: true
 *         description: The product object that needs to be updated.
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             price:
 *               type: string
 *             description:
 *               type: string
 *     responses:
 *       '200':
 *         description: Successfully updated the product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Updated
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       '400':
 *         description: Invalid ID sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Canceled, Invalid ID sent
 *       '404':
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product does not exist
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
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

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     description: Deletes a product by ID from the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         example: 610c1975b5d5a728184cc49d
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the status of the deletion operation
 *                   example: Deleted
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *                   description: The deleted product object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Product was not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Internal Error
 *                 friendlyMsg:
 *                   type: string
 *                   description: A friendly message for the client
 *                   example: Sorry, something went wrong on our end.
 */
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
