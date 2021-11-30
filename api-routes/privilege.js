const express = require("express");
const router = express.Router();
const { error, confirmCredential } = require("../config/config");
const { verify } = require("jsonwebtoken");
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");
const { userHasPrivilege } = require("../validation/auth");
const { post, get, patch, deleter } = require("../services/privilege");
router.post("/privilege", async (req, res, next) => {
  try {
    inputFilter({ action: "string", accessToken: "string" }, {}, req.body, 4);
    inputFilter({}, { description: "string" }, req.body, 0, 300);
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
  const PRIVILEGE_TYPE = "privilege_create";
  if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
  try {
    const data = await post(req.body, next);
    if (data == false) {
      return;
    }
    res.json(data);
  } catch (e) {
    console.log(e);
    error("database", "error", next, 500);
  }
});
router.get("/privilege", async (req, res, next) => {
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
        { action: "string", description: "string" },
        req.body.filter
      );
    }
    if (req.body.sort) {
      //send 0 for decending
      //send 1 for ascending
      sort = inputFilter(
        {},
        {
          action: "number",
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
    action: true,
    description: true,
    concurrency_stamp: true,
    id: true,
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
router.patch("/privilege", async (req, res, next) => {
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
        action: "string",
        description: "string",
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
router.delete("/privilege", async (req, res, next) => {
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
  const PRIVILEGE_TYPE = "privilege_delete";
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
