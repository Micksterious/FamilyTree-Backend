// models/Relationship.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Relationship = sequelize.define(
  "Relationship",
  {
    parent_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    child_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "relationships",
    timestamps: false,
  }
);

module.exports = Relationship;
