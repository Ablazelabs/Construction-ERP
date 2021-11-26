const express = require("express");
const router = express.Router();
const { compare } = require("bcrypt");

const { sequelizer, error } = require("../../config/config");
const { sequelize, QueryTypes } = sequelizer();

const inputFilter = require("../../validation/inputFilter");

const { sign } = require("jsonwebtoken");

router.post("/account/login", async (req, res, next) => {
  try {
    inputFilter(
      { password: "string" },
      { phone_number: "string", email: "string" },
      req.body
    );
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
  try {
    await sequelize.authenticate();
    const queryResult = await sequelize.query(
      `SELECT password,id,access_failed_count FROM account WHERE ${identifier.key} = :value`,
      {
        replacements: identifier,
        type: QueryTypes.SELECT,
      }
    );
    if (queryResult.length == 0) {
      error(identifier.key, "account doesn't exist", next);
      return;
    }
    if (queryResult[0].access_failed_count >= 5) {
      error("access", "denied", next, 423);
      return;
    }
    const correctPassword = await compare(
      req.body.password,
      queryResult[0].password
    );
    if (!correctPassword) {
      await sequelize.query(
        `UPDATE account SET access_failed_count=access_failed_count+1  WHERE ${identifier.key} = :value`,
        {
          replacements: identifier,
          type: QueryTypes.UPDATE,
        }
      );
      error("password", "Wrong password", next);
      return;
    }
    const accessToken = sign(
      {
        id: queryResult[0].id,
      },
      process.env.ACCESS_KEY,
      { expiresIn: "1y" }
    );
    await sequelize.query(
      `UPDATE account SET access_failed_count=0  WHERE ${identifier.key} = :value`,
      {
        replacements: identifier,
        type: QueryTypes.UPDATE,
      }
    );
    res.send({ accessToken });
  } catch (e) {
    error("database", "error", next, 500);
  }
});

module.exports = router;
