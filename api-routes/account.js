const { compare, genSalt, hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const error = (key, message, next, status = 200) => {
  const myError = { status };
  myError[key] = message;
  next(new Error(JSON.stringify(myError)));
};

const { sequelizer } = require("../config/config");
const { sequelize, QueryTypes } = sequelizer();
const validate = require("../validation");

const validation = {
  checkPhoneNumber: (phoneNumber, next) => {
    const splitPhone = phoneNumber.split("-");
    if (splitPhone.length != 2)
      error(
        "phone_number",
        "phone Number must be countryCode-phone_number format",
        next
      );
    let phone_number = splitPhone[1];
    let countryCode = splitPhone[0];
    if (phone_number.length !== 9)
      error("phone_number", "Phone number Length must be 3-9", next);
    if (phone_number[0] !== "9")
      error("phone_number", "Phone number must start with 9", next);
    if (countryCode.length !== 3)
      error("phone_number", "country code must be of 3 length", next);
    if (phone_number.match("[0-9]{9}") && countryCode.match("[0-9]{3}")) {
      return { success: true };
    }
    error("phone_number", "phone number characters must be Numbers", next);
  },
  checkEmail: (email, next) => {
    if (email.match(".+@.+[.].+")) return { success: true };
    else {
      throw error(
        "email",
        "email format must contain @ and . in the middle somewhere",
        next
      );
    }
  },
  checkPassword: (password, next) => {
    if (password.length < 8)
      error("password", "password length must be at least 8", next);
    return { success: true };
  },
};

router.post("/account", async (req, res, next) => {
  //error messages clearly define what the code fragment is trying to achieve

  try {
    validate({}, { phone_number: "string", email: "string" }, req.body);
    validate({ password: "string" }, {}, req.body, 8);
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
  if (identifier["key"] == "phone_number") {
    validation.checkPhoneNumber(identifier["value"], next);
  } else {
    validation.checkEmail(identifier["value"], next);
  }

  validation.checkPassword(req.body.password, next);

  try {
    await sequelize.authenticate();
    const queryResult = await sequelize.query(
      "SELECT * FROM account WHERE :key = :value",
      {
        replacements: identifier,
        type: QueryTypes.SELECT,
      }
    );
    if (queryResult.length != 0) {
      error(identifier.key, "account already registered", next);
      return;
    }
    const salt = await genSalt(10);
    const hashPassword = await hash(req.body.password, salt);
    await sequelize.query(
      `INSERT INTO account(${identifier["key"]},password) VALUES(:value,:hashPassword)`,
      {
        replacements: { ...identifier, hashPassword },
        type: QueryTypes.INSERT,
      }
    );
    res.send({ success: true });
  } catch (e) {
    error("database", "error", next, 500);
  }
});

router.use((err, _req, res, _next) => {
  let myError = JSON.parse(err.message);
  const status = myError.status;
  myError.status = undefined;
  res.status(status).send({ error: myError });
});

module.exports = router;
