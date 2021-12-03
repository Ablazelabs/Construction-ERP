/**
 * @swagger
 * tags:
 *  name: Client
 *  description: API to manage your Category.
 */
/**
 * @swagger
 * path:
 * /client:
 *  post:
 *    summary: Creates a new client
 *    tags: [Client]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              accessToken:
 *                type: string
 *              name:
 *                type: string
 *              tradeName:
 *                type: string
 *              address:
 *                type: string
 *              tel:
 *                type: string
 *              tinNumber:
 *                type: string
 *              contactPersonName:
 *                type: string
 *              contactPersonPhone:
 *                type: string
 *              contactPersonEmail:
 *                type: string
 *              email:
 *                type: string
 *              subCity:
 *                type: string
 *              woreda:
 *                type: string
 *              city:
 *                type: string
 *              startDate:
 *                type: datetime
 *              endDate:
 *                type: datetime
 *              isProtectedForEdit:
 *                    type: string
 *
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
 * /client:
 *  get:
 *    summary: gets clients based on given filter and sort
 *    tags: [Client]
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
 *                  tradeName:
 *                    type: string
 *                  address:
 *                    type: string
 *                  tel:
 *                    type: string
 *                  tinNumber:
 *                    type: string
 *                  contactPersonName:
 *                    type: string
 *                  contactPersonPhone:
 *                    type: string
 *                  contactPersonEmail:
 *                    type: string
 *                  email:
 *                    type: string
 *                  subCity:
 *                    type: string
 *                  woreda:
 *                    type: string
 *                  city:
 *                    type: string
 *              sort:
 *                type: object
 *                required: false
 *                properties:
 *                  name:
 *                    type: integer
 *                  id:
 *                    type: integer
 *                  startDate:
 *                    type: integer
 *                  endDate:
 *                    type: integer
 *                  creationDate:
 *                    type: integer
 *                  revisionDate:
 *                    type: integer
 *                  isProtectedForEdit:
 *                    type: integer
 *                  tradeName:
 *                    type: integer
 *                  address:
 *                    type: integer
 *                  tel:
 *                    type: integer
 *                  tinNumber:
 *                    type: integer
 *                  contactPersonName:
 *                    type: integer
 *                  contactPersonPhone:
 *                    type: integer
 *                  contactPersonEmail:
 *                    type: integer
 *                  email:
 *                    type: integer
 *                  subCity:
 *                    type: integer
 *                  woreda:
 *                    type: integer
 *                  city:
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
 *
 */
/**
 * @swagger
 * path:
 * /client:
 *  patch:
 *    summary: updates a client
 *    tags: [Client]
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
 *              updateData:
 *                type: object
 *                required: true
 *                properties:
 *                  name:
 *                    type: string
 *                  endDate:
 *                    type: endDate
 *                  startDate:
 *                    type: string
 *                  isProtectedForEdit:
 *                    type: string
 *                  tradeName:
 *                    type: string
 *                  address:
 *                    type: string
 *                  tel:
 *                    type: string
 *                  tinNumber:
 *                    type: string
 *                  contactPersonName:
 *                    type: string
 *                  contactPersonPhone:
 *                    type: string
 *                  contactPersonEmail:
 *                    type: string
 *                  email:
 *                    type: string
 *                  subCity:
 *                    type: string
 *                  woreda:
 *                    type: string
 *                  city:
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
 * /client:
 *  delete:
 *    summary: deletes client
 *    tags: [Client]
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

const { userHasPrivilege } = require("../validation/auth");

const { post, get, patch, deleter } = require("../services/client");

router.post("/client", async (req, res, next) => {
  try {
    inputFilter(
      {
        accessToken: "string",
        name: "string",
        tradeName: "string",
        address: "string",
        tel: "string",
        tinNumber: "string",
        contactPersonName: "string",
        contactPersonPhone: "string",
        contactPersonEmail: "string",
        email: "string",
        startDate: "string",
        endDate: "string",
      },
      {
        isProtectedForEdit: "boolean",
        subCity: "string",
        woreda: "string",
        city: "string",
      },
      req.body,
      4
    );
    req.body.startDate = new Date(req.body.startDate);
    req.body.endDate = new Date(req.body.endDate);
    if (!req.body.startDate.getTime()) {
      throw {
        key: "startDate",
        message: "please send date in yyyy/mm/dd format",
      };
    }
    if (!req.body.endDate.getTime()) {
      throw {
        key: "endDate",
        message: "please send date in yyyy/mm/dd format",
      };
    }
  } catch (e) {
    error(e.key, e.message, next, 400);
    return;
  }
  if (
    !validation.checkEmail(req.body.contactPersonEmail, () => {
      error(
        "contactPersonEmail",
        "email format must contain @ and . in the middle somewhere",
        next
      );
    })
  ) {
    return;
  }
  if (!validation.checkEmail(req.body.email, next)) {
    return;
  }
  if (
    !validation.checkEmail(req.body.contactPersonEmail, () => {
      error(
        "contactPersonPhone",
        "phone Number must be countryCode-phone_number format",
        next
      );
    })
  ) {
    return;
  }
  if (
    !validation.checkPhoneNumber(req.body.tel, () => {
      error(
        "tel",
        "phone Number must be countryCode-phone_number format",
        next
      );
    })
  ) {
    return;
  }
  let payLoad;
  try {
    payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
  } catch (e) {
    error("accessToken", "Invalid or Expired Access Token", next, 401);
    return;
  }
  const PRIVILEGE_TYPE = "client_create";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
  try {
    const data = await post(req.body, payLoad.id, next);
    if (data == false) {
      return;
    }
    res.json(data);
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
  }
});
router.get("/client", async (req, res, next) => {
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
          name: "string",
          tradeName: "string",
          address: "string",
          tel: "string",
          tinNumber: "string",
          contactPersonName: "string",
          contactPersonPhone: "string",
          contactPersonEmail: "string",
          email: "string",
          subCity: "string",
          woreda: "string",
          city: "string",
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
          id: "number",
          startDate: "number",
          endDate: "number",
          name: "number",
          isProtectedForEdit: "number",
          tradeName: "number",
          address: "number",
          tel: "number",
          tinNumber: "number",
          contactPersonName: "number",
          contactPersonPhone: "number",
          contactPersonEmail: "number",
          email: "number",
          subCity: "number",
          woreda: "number",
          city: "number",
          revisionDate: "number",
          creationDate: "number",
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

  const PRIVILEGE_TYPE = "client_read";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
  const projection = {
    id: true,
    name: true,
    tradeName: true,
    address: true,
    city: true,
    tel: true,
    tinNumber: true,
    subCity: true,
    woreda: true,
    contactPersonName: true,
    contactPersonPhone: true,
    contactPersonEmail: true,
    email: true,
    startDate: true,
    endDate: true,
    creationDate: true,
    createdBy: true,
    revisionDate: true,
    revisedBy: true,
    status: true,
    isProtectedForEdit: true,
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
    console.log(e);
    error("database", "error", next, 500);
  }
});
router.patch("/client", async (req, res, next) => {
  let updateData = {};
  try {
    inputFilter(
      {
        accessToken: "string",
        id: "number",
        updateData: "object",
      },
      {},
      req.body
    );

    updateData = inputFilter(
      {},
      {
        name: "string",
        tradeName: "string",
        address: "string",
        tel: "string",
        tinNumber: "string",
        contactPersonName: "string",
        contactPersonPhone: "string",
        contactPersonEmail: "string",
        email: "string",
        startDate: "string",
        endDate: "string",
        isProtectedForEdit: "boolean",
        subCity: "string",
        woreda: "string",
        city: "string",
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

  const PRIVILEGE_TYPE = "client_update";
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
router.delete("/client", async (req, res, next) => {
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
