const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const expect = require("chai").expect;
const Product = require("../models/Product.model");

chai.use(chaiHttp);

describe("Testing products", () => {
  before(async () => {
    await mongoose.connect("mongodb://localhost:27017/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        title: "Test Product",
        price: "10",
        description: "This is a test product",
      };

      const res = await chai.request(app).post("/api/product").send(product);

      expect(res.status).to.equal(200);
      expect(typeof res.body).to.equal("object");
      expect(res.body).to.have.property("_id");
      expect(res.body.title).to.equal("Test Product");
      expect(res.body.price).to.equal("10");
      expect(res.body.description).to.equal("This is a test product");
    });
  });

  describe("GET /products", () => {
    it("should get all products", async () => {
      const res = await chai.request(app).get("/api/product");

      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(1);
    });
  });

  describe("GET /products/:id", () => {
    it("should get a product by id", async () => {
      const product = new Product({
        title: "Test Product",
        price: "10",
        description: "This is a test product",
      });

      await product.save();

      const res = await chai.request(app).get(`/api/product/${product._id}`);

      expect(res.status).to.equal(200);
      expect(typeof res.body).to.equal("object");
      expect(res.body._id).to.equal(product._id.toString());
      expect(res.body.title).to.equal("Test Product");
      expect(res.body.price).to.equal("10");
      expect(res.body.description).to.equal("This is a test product");
    });

    it("should return an error message for invalid id", async () => {
      const res = await chai.request(app).get("/api/product/invalid_id");

      expect(res.status).to.equal(400);
      expect(typeof res.body).to.equal("object");
      expect(res.body.message).to.equal("Canceled, Invalid ID sent");
    });

    it("should return a message for non-existent product id", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await chai.request(app).get("/api/product/" + nonExistentId);

      expect(res.status).to.equal(404);
      expect(typeof res.body).to.equal("object");
      expect(res.body.message).to.equal("Product does not exist");
    });
  });

  describe("updateProductById", () => {
    it("should update the product by id", async () => {
      const newProduct = {
        title: "New Product",
        price: "50",
        description: "A new product",
      };

      const createdProduct = await chai
        .request(app)
        .post("/api/product")
        .send(newProduct);

      const updatedProduct = {
        title: "Updated Product",
        price: "60",
        description: "An updated product",
      };

      const res = await chai
        .request(app)
        .put(`/api/product/${createdProduct.body._id}`)
        .send(updatedProduct);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Updated");
      expect(res.body.product.title).to.equal(updatedProduct.title);
      expect(res.body.product.price).to.equal(updatedProduct.price);
      expect(res.body.product.description).to.equal(updatedProduct.description);
    });

    it("should return an error if invalid ID is sent", async () => {
      const updatedProduct = {
        title: "Updated Product",
        price: "60",
        description: "An updated product",
      };

      const res = await chai
        .request(app)
        .put(`/api/product/invalid_id`)
        .send(updatedProduct);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("Canceled, Invalid ID sent");
    });
  });

  describe("deleteProductById", () => {
    let product;

    before(async () => {
      product = new Product({
        title: "Test Product",
        price: "9.99",
        description: "A product for testing purposes",
      });

      await product.save();
    });

    after(async () => {
      await Product.deleteMany({});
    });

    it("should delete a product by ID", async () => {
      const res = await chai.request(app).delete(`/api/product/${product.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Deleted");
      expect(res.body).to.have.property("product");
      expect(res.body.product.title).to.equal("Test Product");
      expect(res.body.product.price).to.equal("9.99");
      expect(res.body.product.description).to.equal(
        "A product for testing purposes"
      );
    });

    it("should return a 400 status if an invalid ID is sent", async () => {
      const res = await chai.request(app).delete("/api/product/invalid-id");

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("Canceled, Invalid ID sent");
    });

    it("should return a 400 status if the product was not found", async () => {
      const res = await chai.request(app).delete(`/api/product/${product.id}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("Product was not found");

      const deletedProduct = await Product.findById(product.id);
      chai.expect(deletedProduct).to.be.null;
    });
  });
});
