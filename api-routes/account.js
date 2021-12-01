/**
 * @swagger
 * components:
 *  schemas:
 *    account:
 *      type: object
 *      required:
 *        -password
 *      properties:
 *        password:
 *          type: string
 *          description: please send a password goddamn it
 *        email:
 *          type: string
 *          description: include @ and .
 *        username:
 *          type: string
 *          description: a short username(normal name)
 *        id:
 *          type: integer
 *          description: The auto-generated id of the book.
 *        phone_number:
 *          type: string
 *          description: countrycode-phone_number format
 *        concurrency_stamp:
 *          type: string
 *          description: a stamp set up to protect multiple update at the same time
 *        role:
 *          type: integer
 *          description: role of a user(admin, normal or otherwise)
 */
/**
 * @swagger
 * tags:
 *  name: Accounts
 *  description: API to manage your users.
 */
/**
 * @swagger
 * path:
 * /account:
 *  post:
 *    summary: Creates a new user
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              password:
 *                type: string
 *                required: true
 *              email:
 *                type: string
 *                required: false
 *              phone_number:
 *                type: string
 *                required: false
 *                description: countrycode-actual number(251-933221144)
 *    responses:
 *      200:
 *        description: success message
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 */
/**
 * @swagger
 * path:
 * /account:
 *  get:
 *    summary: gets selected users
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              accessToken:
 *                type: string
 *                required: true
 *              limit:
 *                type: integer
 *                required: true
 *              skip:
 *                type: integer
 *                required: false
 *              filter:
 *                type: object
 *                required: false
 *                properties:
 *                  username:
 *                    type: string
 *                  email:
 *                    type: string
 *                  phone_number:
 *                    type: string
 *                  role:
 *                    type: number
 *              sort:
 *                type: object
 *                required: false
 *                properties:
 *                  username:
 *                    type: integer
 *                  email:
 *                    type: integer
 *                  phone_number:
 *                    type: integer
 *                  id:
 *                    type: integer
 *    responses:
 *      200:
 *        description: success message
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 */
/**
 * @swagger
 * path:
 * /account:
 *  patch:
 *    summary: updates a user
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              accessToken:
 *                type: string
 *                required: true
 *              concurrency_stamp:
 *                type: string
 *                required: true
 *              id:
 *                type: integer
 *                required: true
 *              updateData:
 *                type: object
 *                required: true
 *                properties:
 *                  username:
 *                    type: string
 *                  email:
 *                    type: string
 *                  phone_number:
 *                    type: string
 *                  role:
 *                    type: number
 *                  two_factor_enabled:
 *                    type: boolean
 *    responses:
 *      200:
 *        description: success message
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 */

/**
 * @swagger
 * path:
 * /account:
 *  delete:
 *    summary: updates a user
 *    tags: [Accounts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              accessToken:
 *                type: string
 *                required: true
 *              id:
 *                type: integer
 *                required: true
 *    responses:
 *      200:
 *        description: success message
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 */

const express = require("express");
const router = express.Router();
const { error } = require("../config/config");
const { verify } = require("jsonwebtoken");
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");

const {
  userHasPrivilege,
  userHasPrivilegeOver,
} = require("../validation/auth");

const { post, get, patch, deleter } = require("../services/account");

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
    let identifier2 = {};
    identifier2[identifier.key] = identifier.value;
    const data = await post(identifier2, identifier.key, req.body, next);
    if (data == false) {
      return;
    }
    res.json(data);
  } catch (e) {
    console.log(e);
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
        {
          username: "string",
          email: "string",
          phone_number: "string",
          role: "number",
        },
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
  const projection = {
    id: true,
    username: true,
    normalized_username: true,
    email: true,
    phone_number: true,
    two_factor_enabled: true,
    lockout_enabled: true,
    concurrency_stamp: true,
    role: true,
  };
  let role = {};
  if (filter.role) {
    role = {
      id: filter.role,
    };
    filter.role = undefined;
  }
  let queryFilter = {};
  for (let i in filter) {
    queryFilter[i] = { contains: filter[i] };
  }
  let querySort = {};
  for (let i in sort) {
    querySort[i] = sort[i] ? "asc" : "desc";
  }
  try {
    res.json(await get(queryFilter, querySort, role, limit, skip, projection));
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
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
        role: "number",
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
  let updateDataProjection = {};
  for (let i in updateData) {
    if (updateData[i]) {
      updateDataProjection[i] = true;
    }
  }
  try {
    const data = await patch(updateDataProjection, req.body, updateData, next);
    if (data == false) {
      return;
    }
    res.json(data);
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
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
    res.json(await deleter(req.body));
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
    return;
  }
});

module.exports = router;
