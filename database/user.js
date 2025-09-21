// database/user.js
const { DataTypes } = require("sequelize");
const db = require("./db");
const bcrypt = require("bcrypt");

const User = db.define(
  "user",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { len: [3, 20] },
      // field: "username", // not needed; default matches
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // you’re requiring it now
      unique: true,
      validate: { isEmail: true },
      // field: "email",
    },
    // IMPORTANT: your DB likely has camelCase "auth0Id", NOT "auth0_id"
    auth0Id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      // REMOVE this line if you had it:
      // field: "auth0_id",
      // If you want to be explicit, you can keep camel explicitly:
      field: "auth0Id",
    },
    // DB DOES have snake_case password column
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "password_hash", // keep snake mapping
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
      // field: "role",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true, // uses created_at / updated_at (your DB has these)
  }
);

// helpers
User.prototype.checkPassword = function (password) {
  if (!this.passwordHash) return false;
  return bcrypt.compareSync(password, this.passwordHash);
};
User.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

module.exports = User;
