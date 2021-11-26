const express = require("express");
const router = express.Router();

const { sequelizer, error, confirmCredential } = require("../../config/config");
const { sequelize, QueryTypes } = sequelizer();

const inputFilter = require("../../validation/inputFilter");

router.post("/account/forgotpassword", async (req, res, next) => {
  try {
    inputFilter({}, { phone_number: "string", email: "string" }, req.body);
  } catch (e) {
    error(e.key, e.message, next, 400);
    return;
  }
  if (!req.body.phone_number && !req.body.email) {
    error("identifier", "email or phone must be provided", next);
    return;
  }
  const identifier = req.body.phone_number
    ? { key: "phone_number", value: req.body.phone_number }
    : { key: "email", value: req.body.email };
  let code = 123434;
  //todo... use the below code instead and send the code really to the email
  //const code = Math.floor(Math.random()*1000000)
  if (code < 100000) {
    code += 100000;
  }

  try {
    await sequelize.authenticate();
    await sequelize.query(
      `UPDATE account SET code = :code WHERE ${identifier.key}=:value`,
      {
        replacements: { ...identifier, code },
        type: QueryTypes.UPDATE,
      }
    );
    await confirmCredential(identifier.value, code);
    res.send({ success: true });
  } catch (e) {
    error("database", "error", next, 500);
  }
});

module.exports = router;
