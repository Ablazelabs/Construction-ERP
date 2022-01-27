const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { put, get, patch } = require("../../../services/shiftSchedule");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");
const defaultDeleter = require("../../defaultDeleter");
const allConfigs = require("./hcmTimeAndLeave.json");
const {
    allRoutes,
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
    uniqueValues,
} = allConfigs;
router.post("/shift_schedule_hdr_dtl", async (req, res, next) => {
    const operationDataType = "shift_schedule_dtl";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    let reqBody = {};
    try {
        reqBody = inputFilter(
            { shiftScheduleDtls: "object", shiftScheduleHdr: "object" },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.shiftScheduleDtls)) {
            throw { key: "shiftScheduleDtls", message: "please send array" };
        }
        if (!reqBody.shiftScheduleDtls.length) {
            throw {
                key: "shiftScheduleDtls",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { shiftScheduleDtls, shiftScheduleHdr } = reqBody;
    let listError = "";
    for (let i in shiftScheduleDtls) {
        shiftScheduleDtls[i] = returnReqBody(
            shiftScheduleDtls[i],
            {
                requiredInputFilter,
                optionalInputFilter,
                dateValue,
                myEnums,
                phoneValue,
                emailValue,
                rangeValues,
            },
            next
        );
        if (!shiftScheduleDtls[i]) {
            return;
        }
        const item = shiftScheduleDtls[i];
        if (item.clock_in && item.clock_out) {
            if (
                !(item.min_working_hours >= 4 && item.min_working_hours <= 10)
            ) {
                listError =
                    "Minimum Working hours must be between 04:00 and 10:00";
                break;
            }

            if (item.clock_in < item.clock_out) {
                const span = item.clock_out - item.clock_in;
                if (span < item.min_working_hours) {
                    listError = `Total working hour(${item.clock_out}-${item.clock_in}) can not be less than minimum working hour`;
                    break;
                }

                item.is_shift_span_next_day = false;
            } else if (item.clock_in > item.clock_out) {
                const span = 24 - (item.clock_in - item.clock_out);
                if (span < item.min_working_hours) {
                    listError = `Total working hour(${item.clock_in}-${item.clock_out}) can not be less than minimum working hour`;
                    break;
                }

                item.is_shift_span_next_day = true;
            }
            item.is_half_day = item.min_working_hours < 5 ? true : false;
        } else {
            error(
                item.clock_in ? "clock_out" : "clock_in",
                "clock in can't be zero",
                next
            );
            return;
        }
    }
    if (listError) {
        error("shiftScheduleDtls", listError, next);
        return;
    }
    shiftScheduleHdr = returnReqBody(
        shiftScheduleHdr,
        {
            requiredInputFilter: allInputFilters["shift_schedule_hdr"],
            optionalInputFilter: allOptionalInputFilters["shift_schedule_hdr"],
            dateValue: dateValues["shift_schedule_hdr"],
            myEnums: enums["shift_schedule_hdr"],
            phoneValue: phoneValues["shift_schedule_hdr"],
            emailValue: emailValues["shift_schedule_hdr"],
            rangeValues: allRangeValues["shift_schedule_hdr"],
        },
        next
    );
    if (!shiftScheduleHdr) {
        return;
    }
    try {
        const data = await post(
            shiftScheduleHdr,
            shiftScheduleDtls,
            res.locals.id,
            uniqueValues["shift_schedule_hdr"],
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
router.get(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    const filters = allFilters[operationDataType],
        sorts = allSorts[operationDataType],
        projections = allProjections[operationDataType];
    const getData = returnGetData(
        req.body,
        { filters, sorts, projections },
        next
    );
    if (!getData) {
        return;
    }
    const { queryFilter, querySort, limit, skip, projection } = getData;
    try {
        res.json(
            await get(
                queryFilter,
                querySort,
                limit,
                skip,
                projection,
                operationDataType
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();

    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const data = returnPatchData(
        req.body,
        {
            requiredInputFilter,
            optionalInputFilter,
            dateValue,
            myEnums,
            phoneValue,
            emailValue,
            rangeValues,
        },
        next
    );
    if (!data) {
        return;
    }
    const { updateData, updateDataProjection } = data;
    try {
        const data = await patch(
            updateDataProjection,
            req.body,
            updateData,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
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
router.put("/shift_schedule_hdr_dtl", async (req, res, next) => {
    const operationDataType = "shift_schedule_dtl";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    let reqBody = {};
    try {
        reqBody = inputFilter(
            { shiftScheduleDtls: "object", shiftScheduleHdrId: "number" },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.shiftScheduleDtls)) {
            throw { key: "shiftScheduleDtls", message: "please send array" };
        }
        if (!reqBody.shiftScheduleDtls.length) {
            throw {
                key: "shiftScheduleDtls",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { shiftScheduleDtls, shiftScheduleHdrId } = reqBody;
    let listError = "";
    for (let i in shiftScheduleDtls) {
        shiftScheduleDtls[i] = returnReqBody(
            shiftScheduleDtls[i],
            {
                requiredInputFilter,
                optionalInputFilter,
                dateValue,
                myEnums,
                phoneValue,
                emailValue,
                rangeValues,
            },
            next
        );
        if (!shiftScheduleDtls[i]) {
            return;
        }
        const item = shiftScheduleDtls[i];
        if (item.clock_in && item.clock_out) {
            if (
                !(item.min_working_hours >= 4 && item.min_working_hours <= 10)
            ) {
                listError =
                    "Minimum Working hours must be between 04:00 and 10:00";
                break;
            }

            if (item.clock_in < item.clock_out) {
                const span = item.clock_out - item.clock_in;
                if (span < item.min_working_hours) {
                    listError = `Total working hour(${item.clock_out}-${item.clock_in}) can not be less than minimum working hour`;
                    break;
                }

                item.is_shift_span_next_day = false;
            } else if (item.clock_in > item.clock_out) {
                const span = 24 - (item.clock_in - item.clock_out);
                if (span < item.min_working_hours) {
                    listError = `Total working hour(${item.clock_in}-${item.clock_out}) can not be less than minimum working hour`;
                    break;
                }

                item.is_shift_span_next_day = true;
            }
            item.is_half_day = item.min_working_hours < 5 ? true : false;
        } else {
            error(
                item.clock_in ? "clock_out" : "clock_in",
                "clock in can't be zero",
                next
            );
            return;
        }
    }
    if (listError) {
        error("shiftScheduleDtls", listError, next);
        return;
    }
    try {
        const data = await put(
            shiftScheduleHdrId,
            shiftScheduleDtls,
            res.locals.id
        );
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.delete(allRoutes, defaultDeleter);
module.exports = router;
