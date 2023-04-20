const User = require("../models/User.model");
const config = require("config");
const jwt = require("../services/JwtService");
const bcrypt = require("bcryptjs");
const ApiError = require("../errors/ApiError");
const mongoose = require("mongoose");

/**
 * Registers a new user.
 *
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to be created
 *         schema:
 *           type: object
 *           required:
 *             - full_name
 *             - email
 *             - password
 *           properties:
 *             full_name:
 *               type: string
 *               description: The full name of the user
 *             email:
 *               type: string
 *               description: The email address of the user
 *             password:
 *               type: string
 *               description: The password of the user
 *     responses:
 *       200:
 *         description: Successfully registered a new user
 *         schema:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the user
 *                 full_name:
 *                   type: string
 *                   description: The full name of the user
 *                 email:
 *                   type: string
 *                   description: The email address of the user
 *                 password:
 *                   type: string
 *                   description: The password of the user
 *                 is_active:
 *                   type: boolean
 *                   description: The activation status of the user
 *             token:
 *               type: string
 *               description: The authentication token of the user
 *       403:
 *         description: Gmail cannot be duplicated
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: The error message
 *       500:
 *         description: Internal error occurred
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: The error message
 *             friendlyMsg:
 *               type: string
 *               description: A friendly message to be displayed to the user
 */
const signUp = async (req, res) => {
  try {
    const { full_name, email, password, is_active } = req.body;

    const checkUnique = await User.findOne({ email });

    if (checkUnique) {
      return res.status(403).send({ message: "Gmail cannot be duplicated" });
    }

    const hashedPassword = bcrypt.hashSync(password, 7);

    const user = await User({
      full_name,
      email,
      password: hashedPassword,
      is_active: true,
    });

    await user.save();

    const payload = {
      id: user._id,
      full_name,
      email,
      password,
      is_active,
    };

    const tokens = jwt.generateTokens(payload);

    const hashedToken = bcrypt.hashSync(tokens.token, 7);

    user.token = hashedToken;
    await user.save();

    res.cookie("token", tokens.token, {
      maxAge: config.get("token_ms"),
      httpOnly: true,
    });

    res.status(200).send({ user: payload, ...tokens });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

/**
 * Authenticates an existing user.
 *
 * @swagger
 * /user/signin:
 *   post:
 *     summary: Authenticate an existing user
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to be authenticated
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               description: The email address of the user
 *             password:
 *               type: string
 *               description: The password of the user
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully authenticated user
 *         schema:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the user
 *                 full_name:
 *                   type: string
 *                   description: The full name of the user
 *                 email:
 *                   type: string
 *                   description: The email address of the user
 *                 password:
 *                   type: string
 *                   description: The password of the user
 *                 is_active:
 *                   type: boolean
 *                   description: The activation status of the user
 *             token:
 *               type: string
 *               description: The authentication token of the user
 *       400:
 *         description: Password is incorrect
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: The error message
 *       404:
 *         description: User does not exist
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: The error message
 *       500:
 *         description: Internal error occurred
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: The error message
 *             friendlyMsg:
 *               type: string
 *               description: A friendly message to be displayed to the user
 */

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send({ message: "User does not exist" });
    }

    const validPassword = bcrypt.compareSync(password, user.password);

    if (!validPassword) {
      return res.status(400).send({ message: "Password is incorrect" });
    }

    const payload = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      password: user.password,
      is_active: true,
    };

    const tokens = jwt.generateTokens(payload);

    const hashedToken = bcrypt.hashSync(tokens.token, 7);

    user.token = hashedToken;
    await user.save();

    res.cookie("token", tokens.token, {
      maxAge: config.get("token_ms"),
      httpOnly: true,
    });

    res.status(200).send({ user: payload, ...tokens });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user by removing token and updating user status
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   description: Logout message
 *       400:
 *         description: Invalid token or token does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 */
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(400).send({ message: "Token does not exist" });
    }

    const user = await User.findOneAndUpdate(
      { token: token },
      { token: "", is_active: false },
      { new: true }
    );

    if (!user) {
      return res.status(400).send({ message: "Token is invalid token" });
    }

    res.clearCookie("token");

    res.status(200).send({ user: user, message: "Logout" });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 friendlyMsg:
 *                   type: string
 *                   description: Friendly error message
 */

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).send(users);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Returns a single user based on ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A single user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       404:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 friendlyMsg:
 *                   type: string
 *                   description: Friendly error message
 */

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(`${id}`)) {
      return res.status(400).send({ message: "Canceled, Invalid ID sent" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: "User does not exist" });
    }

    res.status(200).send(user);
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     description: Update a user based on ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID of the user to update
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: Request body to update user information
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             full_name:
 *               type: string
 *               description: Full name of the user
 *             email:
 *               type: string
 *               description: Email of the user
 *             password:
 *               type: string
 *               description: Password of the user
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID sent or User does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 friendlyMsg:
 *                   type: string
 *                   description: Friendly error message
 */
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(`${id}`)) {
      return res.status(400).send({ message: "Canceled, Invalid ID sent" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).send({ message: "User is does not exists" });
    }

    const { full_name, email } = req.body;
    let { password } = req.body;

    if (password) {
      password = bcrypt.hashSync(password, 7);
    }

    const payload = {
      full_name: full_name || user.full_name,
      email: email || user.email,
      password: password || user.password,
    };

    const updatedUser = await User.findByIdAndUpdate({ _id: id }, payload, {
      new: true,
    });

    await updatedUser.save();

    res.status(200).send({ message: "Updated", user: updatedUser });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Deletes a user with the specified ID. Requires a valid user ID in the URL parameter.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating that the user was deleted
 *                 user:
 *                   type: object
 *                   description: The deleted user object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The unique ID of the user
 *                     name:
 *                       type: string
 *                       description: The name of the user
 *                     email:
 *                       type: string
 *                       description: The email address of the user
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time the user was created
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time the user was last updated
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

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(`${id}`)) {
      return res.status(400).send({ message: "Canceled, Invalid ID sent" });
    }

    const user = await User.findById(id);

    // if (req.user.id !== req.params.id) {
    //   return res.send({ message: "Sizga ruxsat yo'q!" });
    // }

    if (!user) {
      return res.status(400).send({ message: "User was not found" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).send({ message: "Deleted", user });
  } catch (error) {
    ApiError.internal(res, {
      message: error,
      friendlyMsg: "Internal Error",
    });
  }
};

module.exports = {
  signUp,
  signIn,
  logout,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
