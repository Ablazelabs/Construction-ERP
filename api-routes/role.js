/**
 * @swagger
 * components:
 *  schemas:
 *    role:
 *      type: object
 *      required:
 *        -name
 *      properties:
 *        name:
 *          type: string
 *          description: name of a role(like admin, standard user)
 *        id:
 *          type: integer
 *          description: The auto-generated id of the book.
 *        concurrency_stamp:
 *          type: string
 *          description: a stamp set up to protect multiple update at the same time
 *        privilege:
 *          type: array
 *          description: privileges the role has
 *        description:
 *          type: string
 *          description: description of the role
 */
/**
 * @swagger
 * tags:
 *  name: Roles
 *  description: API to manage your Roles.
 */
/**
 * @swagger
 * path:
 * /role:
 *  post:
 *    summary: Creates a new role
 *    tags: [Roles]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                required: true
 *              accessToken:
 *                type: string
 *                required: true
 *              privileges:
 *                type: array
 *                items:
 *                  type: integer
 *              description:
 *                type: string
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
 * /role:
 *  get:
 *    summary: gets selected roles
 *    tags: [Roles]
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
 *                  name:
 *                    type: string
 *                  description:
 *                    type: string
 *              sort:
 *                type: object
 *                required: false
 *                properties:
 *                  name:
 *                    type: integer
 *                  description:
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
 *              items:
 *                type: object
 *                properties:
 *                  name:
 *                    type: string
 *                  description:
 *                    type: string
 *                  concurrency_stamp:
 *                    type: string
 *                  privileges:
 *                    type: array
 *                    items:
 *                      type: object
 *                      schema:
 *                        $ref: '#/components/schemas/role'
 *
 */
/**
 * @swagger
 * path:
 * /roles:
 *  patch:
 *    summary: updates a user
 *    tags: [Roles]
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
 *                  name:
 *                    type: string
 *                  privileges:
 *                    type: array
 *                    items:
 *                      type: integer
 *                  description:
 *                    type: string
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
 * /role:
 *  delete:
 *    summary: updates a user
 *    tags: [Roles]
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
const { userHasPrivilege } = require("../validation/auth");
const { post, get, patch, deleter } = require("../services/role");
router.post("/role", async (req, res, next) => {
  try {
    inputFilter(
      { name: "string", accessToken: "string" },
      { privileges: "object" },
      req.body,
      4
    );
    inputFilter({}, { description: "string" }, req.body, 0, 300);
    if (req.body.privileges) {
      if (!Array.isArray(updateData.privileges)) {
        throw { key: "privileges", message: "must be an array" };
      }
    }
  } catch (e) {
    error(e.key, e.message, next, 400);
    return;
  }
  let payLoad;
  try {
    payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
  } catch (e) {
    error("accessToken", "Invalid or Expired Access Token", next, 401);
    return;
  }
  const PRIVILEGE_TYPE = "role_create";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
  const privileges = req.body.privileges
    ? req.body.privileges.map((element) => {
        return { id: element };
      })
    : [];
  try {
    const data = await post(req.body, privileges, next);
    if (data == false) {
      return;
    }
    res.json(data);
  } catch (e) {
    error("database", "error", next, 500);
  }
});
router.get("/role", async (req, res, next) => {
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
        { name: "string", description: "string" },
        req.body.filter
      );
    }
    if (req.body.sort) {
      //send 0 for decending
      //send 1 for ascending
      sort = inputFilter(
        {},
        {
          name: "number",
          id: "number",
          description: "number",
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

  const PRIVILEGE_TYPE = "role_read";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
  const projection = {
    name: true,
    description: true,
    concurrency_stamp: true,
    id: true,
    privileges: true,
  };
  let queryFilter = {};
  for (let i in filter) {
    queryFilter[i] = { contains: filter[i] };
  }
  let querySort = {};
  for (let i in sort) {
    querySort[i] = sort[i] ? "asc" : "desc";
  }
  try {
    res.json(await get(queryFilter, querySort, limit, skip, projection));
  } catch (e) {
    error("database", "error", next, 500);
  }
});
router.patch("/role", async (req, res, next) => {
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
        name: "string",
        description: "string",
        privileges: "object",
      },
      req.body.updateData
    );
    if (updateData.privileges) {
      if (!Array.isArray(updateData.privileges)) {
        throw { key: "privileges", message: "must be an array" };
      }
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
    return;
  }

  if (Object.keys(updateData).length == 0) {
    error("updateData", "no data has been sent for update", next);
    return;
  }

  const PRIVILEGE_TYPE = "role_update";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

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
router.delete("/role", async (req, res, next) => {
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
  const PRIVILEGE_TYPE = "role_delete";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

  try {
    res.json(await deleter(req.body));
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
    return;
  }
});
module.exports = router;
