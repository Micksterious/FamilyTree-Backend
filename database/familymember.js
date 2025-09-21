// database/familymembers.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const FamilyMember = sequelize.define(
  "FamilyMember",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstname: { type: DataTypes.STRING(100), allowNull: false },
    lastname: { type: DataTypes.STRING(100), allowNull: false },
    date_of_birth: { type: DataTypes.DATEONLY },
    sex: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
  },
  {
    tableName: "familymembers",
    timestamps: false,
    defaultScope: {
      attributes: ["id", "firstname", "lastname", "date_of_birth", "sex"], // exclude userId
    },
  }
);

module.exports = FamilyMember;
