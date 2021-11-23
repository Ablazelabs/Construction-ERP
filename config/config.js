const { Sequelize, QueryTypes } = require("sequelize");
const sequelizer = () => {
  return {
    sequelize: new Sequelize("erp", "root", "", {
      host: "localhost",
      dialect: "mariadb",
    }),
    QueryTypes,
  };
};
module.exports = { sequelizer };
