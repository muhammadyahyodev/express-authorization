const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    is_active: {
      type: Boolean,
      default: false,
    },

    token: {
      type: String,
    },
  },

  { versionKey: false, timestamps: true }
);

module.exports = model("User", userSchema);
