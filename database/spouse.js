// database/Spouse.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Spouse = sequelize.define(
  "Spouse",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    partner1_id: { type: DataTypes.INTEGER, allowNull: false },
    partner2_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "spouses",
    timestamps: false,
    indexes: [{ unique: true, fields: ["partner1_id", "partner2_id"] }],
  }
);

module.exports = Spouse;
