const { genSalt, hash } = require("bcrypt");
const express = require("express");
const router = express.Router();
const { sequelizer, error, confirmCredential } = require("../config/config");
const { sequelize, QueryTypes } = sequelizer();
const { verify } = require("jsonwebtoken");
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");
const pgp = require("pg-promise")();
const {
  userHasPrivilege,
  userHasPrivilegeOver,
} = require("../validation/auth");
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
    if (!validation.checkPhoneNumber(identifier["value"], next)) return;
  } else {
    if (!validation.checkEmail(identifier["value"], next)) return;
  }

  if (!validation.checkPassword(req.body.password, next)) {
    return;
  }
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

  let payLoad;
  try {
    payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
  } catch (e) {
    error("accessToken", "Invalid or Expired Access Token", next, 401);
  }

  const PRIVILEGE_TYPE = "user_read";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

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
    concurrency_stamp: 1,
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
router.patch("/account", async (req, res, next) => {
  let updateData = {};
  try {
    inputFilter(
      {
        accessToken: "string",
        id: "number",
        updateData: "object",
        concurrency_stamp: "string",
      },
      {},
      req.body
    );

    updateData = inputFilter(
      {},
      {
        username: "string",
        email: "string",
        phone_number: "string",
        two_factor_enabled: "boolean",
      },
      req.body.updateData
    );
  } catch (e) {
    error(e.key, e.message, next);
    return;
  }

  let payLoad;
  try {
    payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
  } catch (e) {
    error("accessToken", "Invalid or Expired Access Token", next, 401);
    return;
  }

  if (Object.keys(updateData).length == 0) {
    error("updateData", "no data has been sent for update", next);
    return;
  }

  const PRIVILEGE_TYPE = "user_update";
  if (
    !(await userHasPrivilegeOver(payLoad.id, req.body.id, PRIVILEGE_TYPE, next))
  ) {
    return;
  }
  try {
    await sequelize.authenticate();
    let query = pgp.as.format(
      "SELECT $1:name,concurrency_stamp FROM account WHERE id = $2",
      [updateData, req.body.id]
    );
    query = query.replace(/"/g, "");

    const data = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });
    if (data.length == 0) {
      error("id", "account doesn't exist", next);
    }
    let user = data[0];

    if (user.concurrency_stamp !== req.body.concurrency_stamp) {
      error("concurrency_stamp", "account already updated, refresh", next);
      return;
    }
    if (updateData.email) {
      if (updateData.email === user.email) {
        updateData.email = undefined;
      } else {
        if (!validation.checkEmail(updateData.email, next)) {
          return;
        }
        const data = await sequelize.query(
          "SELECT email FROM account WHERE email = :email",
          {
            replacements: updateData,
            type: QueryTypes.SELECT,
          }
        );
        if (data.length != 0) {
          error("email", "already exists", next);
          return;
        }
      }
    }
    if (updateData.phone_number) {
      if (updateData.phone_number === user.phone_number) {
        updateData.phone_number = undefined;
      } else {
        if (!validation.checkPhoneNumber(updateData.phone_number, next)) {
          return;
        }
        const data = await sequelize.query(
          "SELECT phone_number FROM account WHERE phone_number = :phone_number",
          {
            replacements: updateData,
            type: QueryTypes.SELECT,
          }
        );
        if (data.length != 0) {
          error("phone_number", "already exists", next);
          return;
        }
      }
    }
    let updateQuery = "";
    for (let i in updateData) {
      if (updateData[i]) {
        if (updateQuery) {
          updateQuery += ", ";
        } else {
          updateQuery += "SET ";
        }
        updateQuery += pgp.as
          .format("$1:name = $2", [i, updateData[i]])
          .replace(/"/g, "");
      }
    }
    if (updateQuery) {
      const data = await sequelize.query(
        `UPDATE account ${updateQuery} WHERE id=:id`,
        {
          replacements: { id: req.body.id },
          type: QueryTypes.SELECT,
        }
      );
      res.send({ success: true });
    } else {
      res.send({ success: true });
    }
  } catch (e) {
    console.log(e);
    error(e.key, e.message, next);
    return;
  }
});
router.delete("/account", async (req, res, next) => {
  try {
    inputFilter(
      {
        accessToken: "string",
        id: "number",
      },
      {},
      req.body
    );
  } catch (e) {
    error(e.key, e.message, next);
    return;
  }
  let payLoad;
  try {
    payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
  } catch (e) {
    error("accessToken", "Invalid or Expired Access Token", next, 401);
    return;
  }
  const PRIVILEGE_TYPE = "user_delete";
  if (
    !(await userHasPrivilegeOver(payLoad.id, req.body.id, PRIVILEGE_TYPE, next))
  ) {
    return;
  }
  try {
    sequelize.authenticate();
    await sequelize.query("DELETE FROM account WHERE id = :id", {
      replacements: { id: req.body.id },
      type: QueryTypes.DELETE,
    });
    res.send({ success: true });
  } catch (e) {
    error(e.key, e.message, next);
    return;
  }
});

module.exports = router;
