const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { patch, get } = require("../../../services/jobPosCompStrucRecru");
const {
    returnPatchData,
    returnGetData,
} = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");
const checkIfValid = require("../../../services/vacancyResult");

const meta = require("./jobPosCompStrucRecru.json");
/**
 *
 * @param {Request<{}, any, any, qs.ParsedQs, Record<string, any>>} req
 * @param {Response<any, Record<string, any>, number>} res
 * @param {NextFunction} next
 * @param {boolean} create
 * @returns
 */
const createAndEdit = async (req, res, next, create) => {
    const operationDataType = "vacancy_applicant";
    const requiredInputFilter = {
            remark: "string",
            scale: "number",
            result: "number",
            id: "number",
        },
        optionalInputFilter = {},
        dateValue = meta.dateValues.vacancy_applicant,
        myEnums = meta.enums.vacancy_applicant,
        phoneValue = meta.phoneValues.vacancy_applicant,
        emailValue = meta.emailValues.vacancy_applicant,
        rangeValues = meta.allRangeValues.vacancy_applicant;

    let data = returnPatchData(
        {
            id: req?.body?.id,
            updateData: { scale: -111, ...req?.body, id: undefined },
        },
        {
            requiredInputFilter,
            optionalInputFilter,
            phoneValue,
            emailValue,
            dateValue,
            myEnums,
            rangeValues,
        },
        next
    );
    if (!data) {
        return;
    }
    delete data.updateData.isProtectedForEdit;
    const { updateData, updateDataProjection } = data;
    try {
        let tempReq = { ...requiredInputFilter };
        delete tempReq.id;
        inputFilter(tempReq, {}, updateData);
        if (updateData.scale === -111) {
            throw { key: "scale", message: "please send scale" };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    const tempData = await checkIfValid(req.body.id, next);
    if (tempData == false) {
        return;
    }
    try {
        const data = await patch(
            create
                ? { ...updateDataProjection, application_status: true }
                : updateDataProjection,
            req.body,
            create ? { ...updateData, application_status: 2 } : updateData,
            operationDataType,
            res.locals.id,
            meta.uniqueValues.vacancy_applicant,
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
};
router.post("/vacancy_result", async (req, res, next) => {
    return await createAndEdit(req, res, next, true);
});
router.patch("/vacancy_result", async (req, res, next) => {
    return await createAndEdit(req, res, next, false);
});
router.get("/vacancy_result", async (req, res, next) => {
    try {
        inputFilter({ vacancy_id: "number" }, {}, req.body, 1);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    const operationDataType = "vacancy_applicant";
    const filters = meta.allFilters.vacancy_applicant,
        sorts = meta.allSorts.vacancy_applicant,
        projections = meta.allProjections.vacancy_applicant;
    const getData = returnGetData(
        { ...req.body, filter: { vacancy_id: req.body.vacancy_id } },
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
                { ...queryFilter, application_status: { not: 1 } },
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
router.delete("/vacancy_result", async (req, res, next) => {
    const operationDataType = "vacancy_applicant";
    try {
        inputFilter({ id: "number" }, {}, req.body, 1);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    const tempData = await checkIfValid(req.body.id, next);
    if (tempData == false) {
        return;
    }
    try {
        const data = await patch(
            {},
            req.body,
            { result: 0, scale: 0, remark: "", application_status: 1 },
            operationDataType,
            res.locals.id,
            meta.uniqueValues.vacancy_applicant,
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

module.exports = router;
