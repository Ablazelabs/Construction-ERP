const { genSalt, hash, compare } = require("bcrypt");
const express = require("express");
const router = express.Router();
const { sequelizer, error, confirmCredential } = require("../config/config");
const { sequelize, QueryTypes } = sequelizer();
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");
const pgp = require("pg-promise")();
router.post("/account", async (req, res, next) => {
  //error messages clearly define what the code fragment is trying to achieve

  try {
    inputFilter({}, { phone_number: "string", email: "string" }, req.body);
    inputFilter({ password: "string" }, {}, req.body, 8);
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
      `SELECT * FROM account WHERE ${identifier.key} = :value`,
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

    //create a random number to send to user so that they can confirm it, put in a static code for easier testing
    //TODO remove the 123456 number
    const randomValue = 123456 || Math.random() * 100000;
    await confirmCredential(identifier.value, randomValue);

    await sequelize.query(
      `INSERT INTO account(${identifier["key"]},password, code) VALUES(:value,:hashPassword,:code)`,
      {
        replacements: { ...identifier, hashPassword, code: randomValue },
        type: QueryTypes.INSERT,
      }
    );
    res.send({ success: true });
  } catch (e) {
    error("database", "error", next, 500);
  }
});

router.get("/account", async (req, res, next) => {
  let filter = {};
  let sort = {};
  let skip = 0;
  let limit = 0;
  try {
    inputFilter(
      { limit: "number", accessToken: "string" },
      { skip: "number", filter: "object", sort: "object" },
      req.body
    );
    limit = req.body.limit;
    skip = req.body.skip || 0;
    if (req.body.filter) {
      filter = inputFilter(
        {},
        { username: "string", email: "string", phone_number: "string" },
        req.body.filter
      );
    }
    if (req.body.sort) {
      //send 0 for decending
      //send 1 for ascending
      sort = inputFilter(
        {},
        {
          username: "number",
          email: "number",
          phone_number: "number",
          id: "number",
        },
        req.body.sort
      );
    }
  } catch (e) {
    error(e.key, e.message, next);
    return;
  }

  //making the query!

  let query = "SELECT $1:name FROM account ";
  //USING pgp.as.format to format the sql without risk of sql injection(pgp.as.format is very secure and powerful)
  let rawSqlLikeSearch = "";
  for (let i in filter) {
    if (filter[i]) {
      if (rawSqlLikeSearch) rawSqlLikeSearch += " AND ";
      let searchable = "%" + filter[i] + "%";
      rawSqlLikeSearch += pgp.as.format("$1:name LIKE $2", [i, searchable]);
    }
  }
  let rawSqlSort = "";
  for (let i in sort) {
    if (rawSqlSort) rawSqlSort += ", ";
    if (sort[i]) rawSqlSort += pgp.as.format("$1:name ASC", i);
    else rawSqlSort += pgp.as.format("$1:name DESC", i);
  }

  if (rawSqlLikeSearch) {
    query += " WHERE $2:raw ";
  }
  if (rawSqlSort) {
    query += "ORDER BY $3:raw ";
  }
  query += "LIMIT $4 OFFSET $5";
  console.log(query);
  const projection = {
    id: 1,
    username: 1,
    normalized_username: 1,
    email: 1,
    phone_number: 1,
    two_factor_enabled: 1,
    lockout_enabled: 1,
  };
  query = pgp.as.format(query, [
    projection,
    rawSqlLikeSearch,
    rawSqlSort,
    limit,
    skip,
  ]);
  query = query.replace(/"/g, ``);
  try {
    const queryResult = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    res.send(queryResult);
  } catch (e) {
    error(e.key, e.message, next);
    return;
  }
});

router.use((err, _req, res, _next) => {
  let myError = JSON.parse(err.message);
  const status = myError.status;
  myError.status = undefined;
  res.status(status).send({ error: myError });
});

module.exports = router;
