const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
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
} = require("../../../services/hcmApprovals");
const inputFilter = require("../../../validation/inputFilter");

const arrayInput = {
    id: "number",
    approve: "boolean",
};

router.patch("/leave_transfer_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ approvalLeaveList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.approvalLeaveList)) {
            throw { key: "approvalLeaveList", message: "please send array" };
        }
        if (!reqBody.approvalLeaveList.length) {
            throw {
                key: "approvalLeaveList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalLeaveList } = reqBody;
    let listError = false;
    for (let i in approvalLeaveList) {
        try {
            approvalLeaveList[i] = inputFilter(
                arrayInput,
                {},
                approvalLeaveList[i]
            );
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalLeaveList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await transferApproval(
            approvalLeaveList,
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
router.get(
    [
        "/leave_transfer_approve",
        "/leave_assignment_approve",
        "/leave_plan_approve",
        "/overtime_approve",
    ],
    async (req, res, next) => {
        let reqBody = {};
        const operationDataType = req.path.split("/").pop();
        try {
            reqBody = inputFilter(
                {
                    startDate: "string",
                    endDate: "string",
                    delegated_user_name: "string",
                },
                {
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
            error(e.key, e.message);
            return false;
        }
        try {
            const data = operationDataType.match(/transfer/i)
                ? await getLeaveTransfer(reqBody)
                : operationDataType.match(/assignment/i)
                ? await getLeaveAssignment(reqBody)
                : operationDataType.match(/assignment/i)
                ? await getLeavePlan(reqBody)
                : operationDataType.match(/attendance/i)
                ? await getAttendance(reqBody)
                : await getOvertime(reqBody);
            if (data == false) {
                return;
            }
            return data;
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
        }
    }
);
router.patch("/attendance_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            { approvalAttendanceList: "object" },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.approvalAttendanceList)) {
            throw {
                key: "approvalAttendanceList",
                message: "please send array",
            };
        }
        if (!reqBody.approvalAttendanceList.length) {
            throw {
                key: "approvalAttendanceList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalAttendanceList } = reqBody;
    let listError = false;
    for (let i in approvalAttendanceList) {
        try {
            approvalAttendanceList[i] = inputFilter(
                arrayInput,
                {},
                approvalAttendanceList[i]
            );
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalAttendanceList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await attendanceApproval(
            approvalAttendanceList,
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
        reqBody = inputFilter(
            { approvalOvertimeStatus: "object" },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.approvalOvertimeStatus)) {
            throw {
                key: "approvalOvertimeStatus",
                message: "please send array",
            };
        }
        if (!reqBody.approvalOvertimeStatus.length) {
            throw {
                key: "approvalOvertimeStatus",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalOvertimeStatus } = reqBody;
    let listError = false;
    for (let i in approvalOvertimeStatus) {
        try {
            approvalOvertimeStatus[i] = inputFilter(
                arrayInput,
                {},
                approvalOvertimeStatus[i]
            );
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalOvertimeStatus",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await overtimeApproval(
            approvalOvertimeStatus,
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
router.patch("/leave_assignment_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            { approvalAssignmentList: "object" },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.approvalAssignmentList)) {
            throw {
                key: "approvalAssignmentList",
                message: "please send array",
            };
        }
        if (!reqBody.approvalAssignmentList.length) {
            throw {
                key: "approvalAssignmentList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalAssignmentList } = reqBody;
    let listError = false;
    for (let i in approvalAssignmentList) {
        try {
            approvalAssignmentList[i] = inputFilter(
                arrayInput,
                {},
                approvalAssignmentList[i]
            );
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalAssignmentList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await assignmentApproval(
            approvalAssignmentList,
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
module.exports = router;
