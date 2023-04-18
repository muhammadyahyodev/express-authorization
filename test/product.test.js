const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const expect = require("chai").expect;
const Product = require("../models/Product.model");

chai.use(chaiHttp);

describe("Testing products service", () => {
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
    it("should create a new product", (done) => {
      const product = {
        title: "Test Product",
        price: "10",
        description: "This is a test product",
      };

      chai
        .request(app)
        .post("/api/product")
        .send(product)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.should.have.property("_id");
          res.body.should.have.property("title").eql("Test Product");
          res.body.should.have.property("price").eql("10");
          res.body.should.have
            .property("description")
            .eql("This is a test product");
          done();
        });
    });
  });

  describe("GET /products", () => {
    it("should get all products", (done) => {
      chai
        .request(app)
        .get("/api/product")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          // res.body.length.should.be.eql(1);
          done();
        });
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
    }); // Increase the timeout to 15 seconds

    it("should return an error message for invalid id", (done) => {
      chai
        .request(app)
        .get("/api/product/invalid_id")
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Canceled, Invalid ID sent");
          done();
        });
    });

    it("should return a message for non-existent product id", (done) => {
      const nonExistentId = new mongoose.Types.ObjectId();
      chai
        .request(app)
        .get("/api/product/" + nonExistentId)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a("object");
          res.body.should.have
            .property("message")
            .eql("Product does not exist");
          done();
        });
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
      // Create a product to use in the tests
      product = new Product({
        title: "Test Product",
        price: "9.99",
        description: "A product for testing purposes",
      });
      await product.save();
    });

    it("should delete a product by ID", (done) => {
      chai
        .request(app)
        .delete(`/api/product/${product.id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("message").eql("Deleted");
          res.body.should.have.property("product");
          res.body.product.should.have.property("title").eql("Test Product");
          res.body.product.should.have.property("price").eql("9.99");
          res.body.product.should.have
            .property("description")
            .eql("A product for testing purposes");
          done();
        });
    });

    it("should return a 400 status if an invalid ID is sent", (done) => {
      chai
        .request(app)
        .delete("/api/product/invalid-id")
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have
            .property("message")
            .eql("Canceled, Invalid ID sent");
          done();
        });
    });

    it("should return a 400 status if the product was not found", (done) => {
      chai
        .request(app)
        .delete(`/api/product/${product.id}`)
        .end(async (err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("message").eql("Product was not found");
          // Check that the product was actually deleted from the database
          const deletedProduct = await Product.findById(product.id);
          chai.expect(deletedProduct).to.be.null;
          done();
        });
    });

    after(async () => {
      // Clean up the test database by removing the product
      await Product.deleteMany({});
    });
  });
});
