const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../app");
const expect = require("chai").expect;
const User = require("../models/User.model");
const jwt = require("../services/JwtService");

chai.use(chaiHttp);

describe("Testing user service", () => {
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

  describe("POST /signup", () => {
    it("should create a new user", async () => {
      const user = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        is_active: true,
      };

      const res = await chai.request(app).post("/api/user/signup").send(user);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("user");
      expect(res.body.user.full_name).to.equal(user.full_name);
      expect(res.body.user.email).to.equal(user.email);
      expect(res.body.user.is_active).to.equal(user.is_active);
      expect(res.body.user).to.have.property("password");
      expect(res.body).to.have.property("token");
    });

    it("should not create a user with a duplicate email", async () => {
      const user = {
        full_name: "John Doe",
        email: "john@example.com",
        password: "password123",
        is_active: true,
      };

      const existingUser = new User({
        full_name: "Jane Doe",
        email: "john@example.com",
        password: "password456",
        is_active: false,
      });

      await existingUser.save();

      const res = await chai.request(app).post("/api/user/signup").send(user);

      expect(res.status).to.equal(403);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.equal("Gmail cannot be duplicated");

      const numUsers = await User.countDocuments();
      expect(numUsers).to.equal(2);
    });
  });

  describe("POST /signIn", () => {
    it("should return 404 if user does not exist", async () => {
      const payload = {
        email: "nonexistent@example.com",
        password: "password",
      };

      const res = await chai
        .request(app)
        .post("/api/user/signin")
        .send(payload);
      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "User does not exist");
    });

    it("should return 400 if password is incorrect", async () => {
      const user = new User({
        full_name: "Jane Doe",
        email: "nonexistent@example.com",
        password: "password456",
        is_active: true,
      });

      await user.save();

      const payload = {
        email: "nonexistent@example.com",
        password: "wrong_password",
      };

      const res = await chai
        .request(app)
        .post("/api/user/signin")
        .send(payload);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Password is incorrect");
    });

    it("should sign in the user and return user object and token", async () => {
      const user = {
        full_name: "John Doe",
        email: "other@example.com",
        password: "password456",
        is_active: true,
      };

      await chai.request(app).post("/api/user/signup").send(user);

      const payload = {
        email: "other@example.com",
        password: "password456",
      };

      const res = await chai
        .request(app)
        .post("/api/user/signin")
        .send(payload);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("user");
      expect(res.body.user).to.have.property("id");
      expect(res.body.user).to.have.property("full_name");
      expect(res.body.user).to.have.property("email");
      expect(res.body.user).to.have.property("password");
      expect(res.body.user).to.have.property("is_active", true);
      expect(res.body).to.have.property("token");
      expect(res.header).to.have.property("set-cookie");
    });
  });

  describe("POST /logout", () => {
    let tokens;

    before(async () => {
      const user = new User({
        full_name: "Test User",
        email: "test@example.com",
        password: "password",
        is_active: false,
        token: "",
      });

      await user.save();

      const payload = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        password: user.password,
        is_active: true,
      };

      tokens = jwt.generateTokens(payload);
      user.token = tokens.token;
      await user.save();
    });

    after(async () => {
      await User.deleteMany({});
    });

    it("should return 400 if token is not provided", async () => {
      const res = await chai.request(app).post("/api/user/logout");
      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Token does not exist");
    });

    it("should return 400 if token is invalid", async () => {
      const res = await chai
        .request(app)
        .post("/api/user/logout")
        .set("Cookie", `token=invalid_token`);
      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Token is invalid token");
    });

    it("should log out the user and clear the token cookie", async () => {
      const res = await chai
        .request(app)
        .post("/api/user/logout")
        .set("Cookie", `token=${tokens.token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("user");
      expect(res.body.user).to.have.property("full_name", "Test User");
      expect(res.body.user).to.have.property("email", "test@example.com");
      expect(res.body.user).to.have.property("token", "");
      expect(res.body.user).to.have.property("is_active", false);
      expect(res.body).to.have.property("message", "Logout");
      expect(res.header).to.have.property("set-cookie");
    });
  });

  describe("POST /users", () => {
    it("should get all users", async () => {
      const user = new User({
        full_name: "Test User",
        email: "test@example.com",
        password: "password",
        is_active: false,
        token: "",
      });

      await user.save();

      const res = await chai.request(app).get("/api/user");

      expect(res).to.have.status(200);
      expect(typeof res.body).to.equal("object");
      expect(res.body.length).to.equal(1);
    });
  });

  // ====++++++++++++++++++++++++++++++++++++++++++++++++

  describe("POST /getUserById", () => {
    it("should get a user by id", async () => {
      const user = new User({
        full_name: "FirstName LastName",
        email: "email@gmail.com",
        password: "password",
        is_active: true,
        token: "",
      });

      await user.save();

      const res = await chai.request(app).get(`/api/user/${user._id}`);

      expect(res.status).to.equal(200);
      expect(typeof res.body).to.equal("object");
      expect(res.body._id).to.equal(user._id.toString());
      expect(res.body.full_name).to.equal("FirstName LastName");
      expect(res.body.email).to.equal("email@gmail.com");
      expect(res.body.password).to.equal("password");
      expect(res.body.is_active).to.equal(true);
      expect(res.body.token).to.equal("");
    });

    it("should return an error message for invalid id", async () => {
      const res = await chai.request(app).get("/api/user/invalid_id");

      expect(res.status).to.equal(400);
      expect(typeof res.body).to.equal("object");
      expect(res.body.message).to.equal("Canceled, Invalid ID sent");
    });

    it("should return a message for non-existent product id", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await chai.request(app).get("/api/user/" + nonExistentId);

      expect(res.status).to.equal(404);
      expect(typeof res.body).to.equal("object");
      expect(res.body.message).to.equal("User does not exist");
    });
  });

  describe("POST /updateUserById", () => {
    let tokens;
    let testUser;

    before(async () => {
      testUser = new User({
        full_name: "Test User",
        email: "test@example.com",
        password: "password",
        is_active: false,
        token: "",
      });

      await testUser.save();

      const payload = {
        id: testUser.id,
        full_name: testUser.full_name,
        email: testUser.email,
        password: testUser.password,
        is_active: true,
      };

      tokens = jwt.generateTokens(payload);
      testUser.token = tokens.token;
      await testUser.save();
    });

    after(async () => {
      await User.deleteMany({});
    });

    it("should update the user by id", async () => {
      const updateUser = {
        full_name: "Nodir Karimov",
        email: "nodir@gmail.com",
        password: "password",
        is_active: false,
      };

      const res = await chai
        .request(app)
        .put(`/api/user/${testUser._id.toString()}`)
        .set("Authorization", `Bearer ${tokens.token}`)
        .send(updateUser);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Updated");
      expect(res.body.user.full_name).to.equal(updateUser.full_name);
      expect(res.body.user.email).to.equal(updateUser.email);
      expect(res.body.user).to.have.property("password");
      expect(res.body.user.is_active).to.equal(updateUser.is_active);
      // expect(res.body.user.token).to.equal(updateUser.token);
    });
  });

  describe("deleteUserById", () => {
    let user;

    before(async () => {
      user = new User({
        full_name: "Test User",
        email: "test@example.com",
        password: "password",
        is_active: false,
        token: "",
      });

      await user.save();

      const payload = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        password: user.password,
        is_active: true,
      };

      tokens = jwt.generateTokens(payload);
      user.token = tokens.token;
      await user.save();
    });

    it("should delete a user by ID", async () => {
      const res = await chai
        .request(app)
        .delete(`/api/user/${user.id}`)
        .set("Authorization", `Bearer ${tokens.token}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Deleted");
      expect(res.body).to.have.property("user");
      expect(res.body.user.full_name).to.equal("Test User");
      expect(res.body.user.email).to.equal("test@example.com");
      expect(res.body.user).to.have.property("password");
      expect(res.body.user.is_active).to.equal(false);
    });

    it("should return a 400 status if the product was not found", async () => {
      const res = await chai
        .request(app)
        .delete(`/api/user/${user.id}`)
        .set("Authorization", `Bearer ${tokens.token}`);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("User was not found");

      const deletedUser = await User.findById(user.id);
      chai.expect(deletedUser).to.be.null;
    });
  });
});
