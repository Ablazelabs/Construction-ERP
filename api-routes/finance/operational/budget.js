const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { post, get, patch } = require("../../../services/budget");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const allConfigs = require("./rest_finance_operational.json");
const {
    allRoutes,
    allPostRoutes,
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
    allProjections,
    allSorts,
    allFilters,
} = allConfigs;

router.post("/budget", async (req, res, next) => {
    let reqBody = {};
    const budgetData = {
        requiredInputFilter: allInputFilters["budget"],
        optionalInputFilter: {
            ...allOptionalInputFilters["budget"],
            is_applicable_material_request: "boolean",
            purchase_request: "boolean",
            booking_actual_expense: "boolean",
        },
        dateValue: dateValues["budget"],
        myEnums: enums["budget"],
        phoneValue: phoneValues["budget"],
        emailValue: emailValues["budget"],
        rangeValues: allRangeValues["budget"],
    };
    const budgetControlActionData = {
        requiredInputFilter: {
            accounts: "object",
        },
        optionalInputFilter: {
            annual_budget_exceeded_mr: "number",
            annual_budget_exceeded_po: "number",
            annual_budget_exceeded_actual: "number",
        },
        dateValues: dateValues["budget_control_action"],
        myEnums: {
            annual_budget_exceeded_mr:
                enums["budget_control_action"]
                    .action_accumulated_monthly_budget_exceeded,
            annual_budget_exceeded_po:
                enums["budget_control_action"]
                    .action_accumulated_monthly_budget_exceeded,
            annual_budget_exceeded_actual:
                enums["budget_control_action"]
                    .action_accumulated_monthly_budget_exceeded,
        },
        phoneValue: phoneValues["budget_control_action"],
        emailValue: emailValues["budget_control_action"],
        rangeValues: allRangeValues["budget_control_action"],
    };
    try {
        reqBody = inputFilter(
            {
                budget: "object",
                budgetControlAction: "object",
            },
            {},
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { budget, budgetControlAction } = reqBody;

    budget = returnReqBody(budget, budgetData, next);
    if (!budget) {
        return;
    }
    budgetControlAction = returnReqBody(
        budgetControlAction,
        budgetControlActionData,
        next
    );
    if (!budgetControlAction) {
        return;
    }

    try {
        if (!Array.isArray(budgetControlAction.accounts)) {
            throw { key: "accounts", message: "please send array" };
        }
        if (!budgetControlAction.accounts.length) {
            throw {
                key: "contactPersons",
                message: "array can't be empty",
            };
        }
        for (let i in budgetControlAction.accounts) {
            if (typeof budgetControlAction.accounts[i] == "number") {
                budgetControlAction.accounts[i] = Math.floor(
                    budgetControlAction.accounts[i]
                );
                continue;
            }
            throw {
                key: "accounts",
                message: "all data in accounts must be list of numbers",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }

    try {
        const data = await post(
            budget,
            budgetControlAction,
            res.locals.id,
            next
        );
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
// router.patch("/budget", async (req, res, next) => {
//     const operationDataType = req.path.split("/").pop();

//     const requiredInputFilter = allInputFilters[operationDataType],
//         optionalInputFilter = allOptionalInputFilters[operationDataType],
//         dateValue = dateValues[operationDataType],
//         myEnums = enums[operationDataType],
//         phoneValue = phoneValues[operationDataType],
//         emailValue = emailValues[operationDataType],
//         rangeValues = allRangeValues[operationDataType];

//     const data = returnPatchData(
//         req.body,
//         {
//             requiredInputFilter,
//             optionalInputFilter,
//             dateValue,
//             myEnums,
//             phoneValue,
//             emailValue,
//             rangeValues,
//         },
//         next
//     );
//     if (!data) {
//         return;
//     }
//     const { updateData, updateDataProjection } = data;
//     try {
//         const data = await patch(
//             updateDataProjection,
//             req.body,
//             updateData,
//             operationDataType,
//             res.locals.id,
//             next
//         );
//         if (data == false) {
//             return;
//         }
//         res.json(data);
//     } catch (e) {
//         console.log(e);
//         error("database", "error", next, 500);
//         return;
//     }
// });
module.exports = router;
