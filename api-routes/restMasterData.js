/**
 * @swagger
 * components:
 *  schemas:
 *    restMasterData:
 *      type: object
 *      required:
 *        -name
 *        -id
 *      properties:
 *        id:
 *          type: integer
 *        name:
 *          type: string
 *        description:
 *          type: string
 *        startDate:
 *          type: datetime
 *        endDate:
 *          type: datetime
 *        creationDate:
 *          type: datetime
 *        createdBy:
 *          type: string
 *        revisionDate:
 *          type: datetime
 *        revisedBy:
 *          type: string
 *        status:
 *          type: integer
 *        isProtectedForEdit:
 *          type: boolean
 */
/**
 * @swagger
 * tags:
 *  name: Equipment
 *  description: API to manage your Equipment.
 */
/**
 * @swagger
 * tags:
 *  name: Evaluation
 *  description: API to manage your Evaluation.
 */
/**
 * @swagger
 * tags:
 *  name: Instruction
 *  description: API to manage your Instruction.
 */
/**
 * @swagger
 * tags:
 *  name: ManPower
 *  description: API to manage your ManPower.
 */
/**
 * @swagger
 * tags:
 *  name: Material Category
 *  description: API to manage your Material Category.
 */
/**
 * @swagger
 * tags:
 *  name: Phase
 *  description: API to manage your Phase.
 */
/**
 * @swagger
 * tags:
 *  name: Priority
 *  description: API to manage your Priority.
 */
/**
 * @swagger
 * tags:
 *  name: Work Category
 *  description: API to manage your Category.
 */
/**
 * @swagger
 * path:
 * /tagname:
 *  post:
 *    summary: tagname stands for the name of the header(eg /equipment)
 *    tags: [Equipment,Evaluation,Instruction,ManPower,Material Category,Phase,Priority,Work Category]
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
 *              name:
 *                type: string
 *                required: true
 *              description:
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
 * /tagname:
 *  get:
 *    summary: tagname stands for the name of the header(eg /equipment)
 *    tags: [Equipment,Evaluation,Instruction,ManPower,Material Category,Phase,Priority,Work Category]
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
 *                  startDate:
 *                    type:integer
 *                  endDate:
 *                    type:integer
 *                  creationDate:
 *                    type:integer
 *                  revisionDate:
 *                    type:integer
 *                  isProtectedForEdit:
 *                    type:integer
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
 * /tagname:
 *  patch:
 *    summary: tagname stands for the name of the header(eg /equipment)
 *    tags: [Equipment,Evaluation,Instruction,ManPower,Material Category,Phase,Priority,Work Category]
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
 *                  description:
 *                    type: string
 *                  endDate:
 *                    type: endDate
 *                  startDate:
 *                    type: string
 *                  isProtectedForEdit:
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
 * /tagname:
 *  delete:
 *    summary: tagname stands for the name of the header(eg /equipment)
 *    tags: [Equipment,Evaluation,Instruction,ManPower,Material Category,Phase,Priority,Work Category]
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
const { post, get, patch, deleter } = require("../services/restMasterData");
const allRoutes = [
    "/equipment",
    "/evaluation",
    "/instruction",
    "/manpower",
    "/material_category",
    "/phase",
    "/priority",
    "/work_category",
];
router.post(allRoutes, async (req, res, next) => {
    const masterDataType = req.path.split("/")[1];
    const color = masterDataType == "priority" ? { color: "string" } : {};
    try {
        inputFilter(
            {
                accessToken: "string",
                name: "string",
                startDate: "string",
                endDate: "string",
            },
            {
                isProtectedForEdit: "boolean",
                ...color,
            },
            req.body,
            4
        );
        inputFilter({}, { description: "string" }, req.body, 0, 300);
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
    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
        return;
    }
    const PRIVILEGE_TYPE = `${masterDataType}_create`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
    try {
        const data = await post(req.body, payLoad.id, masterDataType, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get(allRoutes, async (req, res, next) => {
    let filter = {};
    let sort = {};
    let skip = 0;
    let limit = 0;
    const masterDataType = req.path.split("/")[1];
    const color =
        masterDataType == "priority"
            ? [{ color: "string" }, { color: "number" }, { color: true }]
            : [{}, {}, {}];
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
                    description: "string",
                    ...color[0],
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
                    name: "number",
                    id: "number",
                    description: "number",
                    startDate: "number",
                    endDate: "number",
                    creationDate: "number",
                    revisionDate: "number",
                    isProtectedForEdit: "number",
                    ...color[1],
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

    const PRIVILEGE_TYPE = `${masterDataType}_read`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
    const projection = {
        name: true,
        description: true,
        id: true,
        startDate: true,
        endDate: true,
        creationDate: true,
        createdBy: true,
        revisionDate: true,
        revisedBy: true,
        status: true,
        isProtectedForEdit: true,
        ...color[2],
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
        res.json(
            await get(
                queryFilter,
                querySort,
                limit,
                skip,
                projection,
                masterDataType
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch(allRoutes, async (req, res, next) => {
    let updateData = {};
    const masterDataType = req.path.split("/")[1];
    const color = masterDataType == "priority" ? { color: "string" } : {};
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
                description: "string",
                startDate: "string",
                endDate: "string",
                isProtectedForEdit: "boolean",
                ...color,
            },
            req.body.updateData
        );
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
            if (!updateData.startDate.getTime()) {
                throw {
                    key: "startDate",
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
            if (!updateData.endDate.getTime()) {
                throw {
                    key: "endDate",
                    message: "please send date in yyyy/mm/dd format",
                };
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

    const PRIVILEGE_TYPE = `${masterDataType}_update`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

    let updateDataProjection = {};
    for (let i in updateData) {
        if (updateData[i]) {
            updateDataProjection[i] = true;
        }
    }
    try {
        const data = await patch(
            updateDataProjection,
            req.body,
            updateData,
            masterDataType,
            payLoad.id,
            next
        );
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
router.delete(allRoutes, async (req, res, next) => {
    const masterDataType = req.path.split("/")[1];
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
    const PRIVILEGE_TYPE = `${masterDataType}_delete`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

    try {
        res.json(await deleter(req.body, masterDataType));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
module.exports = router;
