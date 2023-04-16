const User = require("../models/User.model");
const config = require("config");
const jwt = require("../services/JwtService");
const bcrypt = require("bcryptjs");
const ApiError = require("../errors/ApiError");
const mongoose = require("mongoose");

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: create new user
 *     tags: [User]
 *     parameters:
 *       - full_name: Jasur Hamidov
 *         description: fullname of user
 *         in: formData
 *         required: true
 *         type: string
 *       - email: jasur@gmail.com
 *         description: email of user
 *         in: formData
 *         required: true
 *         type: string
 *       - password: qwerty
 *         description: password of user
 *         in: formData
 *         required: true
 *         type: string
 *       - is_active: false
 *         description: status of user
 *         in: formData
 *         required: false
 *         type: boolean
 *     responses:
 *       200:
 *         description: Success
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
 * @swagger
 * /user/signin:
 *   post:
 *     summary: login user
 *     tags: [User]
 *     parameters:
 *       - email: jasur@gmail.com
 *         description: email of user
 *         in: formData
 *         required: true
 *         type: string
 *       - password: qwerty
 *         description: password of user
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *
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

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(400).send({ message: "Token is does exists" });
    }

    const user = await User.findOneAndUpdate(
      { token: token },
      { token: "", is_active: false },
      { new: true }
    );

    if (!user) {
      return res.status(400).send({ message: "Token is does exists" });
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
 *     summary: get all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli so'rov
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
 * /user:id:
 *   get:
 *     summary: get user by id
 *     tags: [User]
 *     parameters:
 *       - id: 643a8f89b7cadc06295280e1
 *         description: user id
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
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
 * /user/:id:
 *   put:
 *     summary: Update user
 *     tags: [User]
 *     parameters:
 *       - full_name: Davron Ergashev
 *         description: User name
 *         in: formData
 *         required: true
 *         type: string
 *       - email: davron@gmail.com
 *         description: email of user
 *         in: formData
 *         required: true
 *         type: string
 *       - password: ytreewq
 *         description: password of user
 *         in: formData
 *         required: true
 *         type: string
 *       - is_active: false
 *         description: status user
 *         in: formData
 *         required: false
 *         type: boolean
 *     responses:
 *       200:
 *         description: Foydalanuvchi muvaffaqiyatli qo'shildi
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

    const { full_name, email, password } = req.body;

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
 * /user/:id:
 *   delete:
 *     summary: Delete user by id
 *     tags: [User]
 *     parameters:
 *       - id: user name
 *         description: full name of user
 *         in: formdata
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
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
      return res.status(400).send({ friendlyMsg: "Information was not found" });
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
