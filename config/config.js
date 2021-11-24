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
const confirmCredential = async (to, code) => {
  //TODO
  /**
   * send email or sms to given to(could be phone or email)
   * nothing else to worry about
   */
};
const error = (key, message, next, status = 400) => {
  const myError = { status };
  myError[key] = message;
  next(new Error(JSON.stringify(myError)));
};
module.exports = { sequelizer, error, confirmCredential };
