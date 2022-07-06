const express = require("express");
const router = express.Router();
const { error, getOperationDataType } = require("../../../config/config");
const {
    transferApproval,
    getLeaveTransfer,
    getLeaveAssignment,
    assignmentApproval,
    getLeavePlan,
    getAttendance,
    attendanceApproval,
    getOvertime,
    overtimeApproval,
    planApproval,
} = require("../../../services/hcmApprovals");
const inputFilter = require("../../../validation/inputFilter");

const arrayInput = {
    id: "number",
    approve: "boolean",
};

router.get(
    [
        "/leave_transfer_approve",
        "/leave_assignment_approve",
        "/leave_plan_approve",
        "/overtime_approve",
        "/attendance_approve",
    ],
    async (req, res, next) => {
        let reqBody = {};
        const operationDataType = getOperationDataType(req.path);
        try {
            reqBody = inputFilter(
                {},
                {
                    startDate: "string",
                    endDate: "string",
                    employee_id: "number",
                },
                req.body
            );
            const dateValue = ["startDate", "endDate"];
            for (let i in dateValue) {
                if (!reqBody[dateValue[i]]) {
                    continue;
                }
                reqBody[dateValue[i]] = new Date(reqBody[dateValue[i]]);
                if (!reqBody[dateValue[i]].getTime()) {
                    throw {
                        key: dateValue[i],
                        message: "please send date in yyyy/mm/dd format",
                    };
                }
            }
        } catch (e) {
            error(e.key, e.message, next);
            return false;
        }
        try {
            const data = operationDataType.match(/transfer/i)
                ? await getLeaveTransfer(reqBody)
                : operationDataType.match(/assignment/i)
                ? await getLeaveAssignment(reqBody)
                : operationDataType.match(/plan/i)
                ? await getLeavePlan(reqBody)
                : operationDataType.match(/attendance/i)
                ? await getAttendance(reqBody)
                : await getOvertime(reqBody);
            if (data === false) {
                return;
            }
            res.json(data);
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
        }
    }
);
router.patch("/leave_transfer_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ approvalList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.approvalList)) {
            throw { key: "approvalList", message: "please send array" };
        }
        if (!reqBody.approvalList.length) {
            throw {
                key: "approvalList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalList } = reqBody;
    let listError = false;
    for (let i in approvalList) {
        try {
            approvalList[i] = inputFilter(arrayInput, {}, approvalList[i]);
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await transferApproval(approvalList, res.locals.id, next);
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
        return false;
    }
});
router.patch("/attendance_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ approvalList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.approvalList)) {
            throw {
                key: "approvalList",
                message: "please send array",
            };
        }
        if (!reqBody.approvalList.length) {
            throw {
                key: "approvalList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalList } = reqBody;
    let listError = false;
    for (let i in approvalList) {
        try {
            approvalList[i] = inputFilter(arrayInput, {}, approvalList[i]);
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await attendanceApproval(
            approvalList,
            res.locals.id,
            next
        );
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
        return false;
    }
});
router.patch("/overtime_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ approvalList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.approvalList)) {
            throw {
                key: "approvalList",
                message: "please send array",
            };
        }
        if (!reqBody.approvalList.length) {
            throw {
                key: "approvalList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalList } = reqBody;
    let listError = false;
    for (let i in approvalList) {
        try {
            approvalList[i] = inputFilter(arrayInput, {}, approvalList[i]);
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await overtimeApproval(approvalList, res.locals.id, next);
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
        return false;
    }
});
router.patch("/leave_assignment_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ approvalList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.approvalList)) {
            throw {
                key: "approvalList",
                message: "please send array",
            };
        }
        if (!reqBody.approvalList.length) {
            throw {
                key: "approvalList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalList } = reqBody;
    let listError = false;
    for (let i in approvalList) {
        try {
            approvalList[i] = inputFilter(arrayInput, {}, approvalList[i]);
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await assignmentApproval(
            approvalList,
            res.locals.id,
            next
        );
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
        return false;
    }
});
router.patch("/leave_plan_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ approvalList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.approvalList)) {
            throw {
                key: "approvalList",
                message: "please send array",
            };
        }
        if (!reqBody.approvalList.length) {
            throw {
                key: "approvalList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalList } = reqBody;
    let listError = false;
    for (let i in approvalList) {
        try {
            approvalList[i] = inputFilter(arrayInput, {}, approvalList[i]);
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await planApproval(approvalList, res.locals.id, next);
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
