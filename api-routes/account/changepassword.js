const express = require("express");
const router = express.Router();
const { verify } = require("jsonwebtoken");
const { genSalt, hash, compare } = require("bcrypt");

const { sequelizer, error, confirmCredential } = require("../../config/config");
const { sequelize, QueryTypes } = sequelizer();

const inputFilter = require("../../validation/inputFilter");
const { userHasPrivilegeOver } = require("../../validation/auth");
const validation = require("../../validation/validation");
router.post("/account/changepassword", async (req, res, next) => {
  try {
    inputFilter(
      { newPassword: "string" },
      {
        accessToken: "string",
        tempAccessToken: "string",
        id: "number",
        password: "string",
      },
      req.body
    );
  } catch (e) {
    error(e.key, e.message, next);
    return;
  }
  if (!req.body.accessToken && !req.body.tempAccessToken) {
    error("access", "temp or full access token must be provided", next);
    return;
  }
  if (!validation.checkPassword(req.body.newPassword, next)) {
    return;
  }
  let payLoad;
  try {
    payLoad = verify(
      req.body.tempAccessToken || req.body.accessToken,
      process.env.ACCESS_KEY
    );
  } catch (e) {
    console.log("where 1");
    console.log(e);
    error(
      req.body.tempAccessToken ? "tempAccessToken" : "accessToken",
      "Invalid or Expired Access Token",
      next,
      401
    );
    console.log("where 2");
    return;
  }
  let id;
  let selfUpdate = false;
  if (req.body.tempAccessToken) {
    id = payLoad.tempId;
  } else {
    if (!req.body.id && req.body.id != 0) {
      if (req.body.password) {
        selfUpdate = true;
        id = payLoad.id;
      } else {
        error("id", "must be given with access token", next);
        return;
      }
    } else {
      id = req.body.id;
    }
    const PRIVILEGE_TYPE = "user_update";
    if (
      !(await userHasPrivilegeOver(
        payLoad.id,
        req.body.id,
        PRIVILEGE_TYPE,
        next
      ))
    ) {
      return;
    }
  }

  try {
    await sequelize.authenticate();
    if (selfUpdate) {
      const queryResult = await sequelize.query(
        `SELECT password FROM account WHERE id = :id`,
        {
          replacements: { id },
          type: QueryTypes.SELECT,
        }
      );
      if (queryResult.length == 0) {
        error(identifier.key, "account doesn't exist", next);
        return;
      }
      const correctPassword = await compare(
        req.body.password,
        queryResult[0].password
      );
      if (!correctPassword) {
        error("password", "Wrong password", next);
        return;
      }
    }
    const salt = await genSalt(10);
    const hashPassword = await hash(req.body.newPassword, salt);
    await sequelize.query(
      `UPDATE account SET password = :password WHERE id=:value`,
      {
        replacements: { password: hashPassword, value: id },
        type: QueryTypes.UPDATE,
      }
    );
    res.send({ success: true });
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
  }
});
module.exports = router;
