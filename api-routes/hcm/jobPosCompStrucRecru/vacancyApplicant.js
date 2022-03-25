const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    post,
    deleteFnExternal,
    deleteFnInternal,
} = require("../../../services/vacancyApplicant");
const { returnReqBody } = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");
const { renameSync, unlinkSync, mkdirSync, existsSync } = require("fs");

const allConfigs = require("./jobPosCompStrucRecru.json");
const {
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
    uniqueValues,
} = allConfigs;

const multer = require("multer");
const uploadValidation = require("../../../validation/uploadValidation");

const upload = multer({ dest: "uploads/" });
const deleteUnusedFile = (file) => {
    try {
        if (file && file.path) unlinkSync(file.path);
    } catch {}
};
router.post(
    "/vacancy_applicant_external",
    upload.single("file"),
    async (req, res, next) => {
        const operationDataType = "external_applicant";
        const fileRequired = { external_applicant: true };
        const realTypes = {
            ...allOptionalInputFilters["external_applicant"],
            ...allInputFilters["external_applicant"],
            vacancy_id: "number",
        };
        let fakeTypes = {};
        for (let i in realTypes) {
            fakeTypes[i] = "string";
        }
        let reqBody;
        try {
            reqBody = inputFilter({}, fakeTypes, req.body, 1);
            for (let i in realTypes) {
                const type = realTypes[i];
                if (!reqBody[i]) {
                    continue;
                }
                if (type == "number") {
                    reqBody[i] = Number(reqBody[i]);
                    if (reqBody[i] > 0 || reqBody[i] < 0 || reqBody[i] === 0) {
                    } else {
                        throw { key: i, message: "please send number" };
                    }
                } else if (type == "boolean") {
                    if (reqBody[i] === "false" || reqBody[i] === "true") {
                        if (reqBody[i] === "false") reqBody[i] = false;
                        if (reqBody[i] === "true") reqBody[i] = true;
                    } else {
                        throw { key: i, message: "please send boolean" };
                    }
                }
            }
        } catch (e) {
            error(e.key, e.message, next, 400);
            deleteUnusedFile(req.file);
            return;
        }
        try {
            const fileIsGood = uploadValidation(req.file, ["pdf"], next, true);
            if (!fileIsGood && fileRequired[operationDataType]) {
                deleteUnusedFile(req.file);
                return;
            }
            if (fileIsGood) {
                const fileType = req.file.originalname.split(".").pop();
                const newDestination = `uploads\\${operationDataType}\\${req.file.filename}.${fileType}`;
                const fileUrl = `/uploads/${operationDataType}/${req.file.filename}.${fileType}`;
                try {
                    const dir = `uploads\\${operationDataType}`;
                    if (!existsSync(dir)) {
                        mkdirSync(dir);
                    }
                    renameSync(req.file.path, newDestination);
                } catch (e) {
                    console.log(e);
                    deleteUnusedFile(req.file);
                    error("file", "couldn't rename", next);
                    return;
                }
                reqBody["file"] = fileUrl;
                reqBody["name"] = req.file.filename;
                reqBody["type"] = fileType;
            }
        } catch {
            deleteUnusedFile(req.file);
            return;
        }
        req.body = { ...reqBody };
        next();
    }
);

router.post("/external_applicant", async (req, res, next) => {
    const operationDataType = "external_applicant";
    const optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const requiredInputFilter = allInputFilters[operationDataType];
    const reqBody = returnReqBody(
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
    if (!reqBody) {
        return;
    }
    const reqBody2 = returnReqBody(
        req.body,
        {
            requiredInputFilter: { vacancy_id: "number" },
            optionalInputFilter: {},
            dateValue: [],
            myEnums: {},
            phoneValue: [],
            emailValue: [],
            rangeValues: {},
        },
        next
    );
    if (!reqBody2) {
        return;
    }

    try {
        const data = await post(
            reqBody,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            next,
            true
        );
        if (data == false) {
            return;
        }
        const data2 = await post(
            {
                ...reqBody2,
                application_date: new Date(),
                application_status: 1,
                is_employee: 2,
                external_applicant_id: data.id,
                name: reqBody.applicant_name,
            },
            "vacancy_applicant",
            res.locals.id,
            uniqueValues["vacancy_applicant"],
            next
        );
        if (data2 == false) {
            return;
        }
        res.json(data2);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.delete("/external_applicant", async (req, res, next) => {
    try {
        inputFilter({ id: "number" }, {}, req.body);
        console.log(req.body);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        res.json(await deleteFnExternal(req.body.id));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
router.post("/vacancy_internal_applicant", async (req, res, next) => {
    const operationDataType = "vacancy_internal_applicant";
    const optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const requiredInputFilter = allInputFilters[operationDataType];

    const reqBody = returnReqBody(
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
    if (!reqBody) {
        return;
    }
    try {
        const data = await post(
            {
                ...reqBody,
                application_date: new Date(),
                application_status: 1,
                is_employee: 1,
            },
            "vacancy_applicant",
            res.locals.id,
            uniqueValues["vacancy_applicant"],
            next
        );
        if (data == false) {
            return;
        }
        const data2 = await post(
            reqBody,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            next
        );
        if (data2 == false) {
            return;
        }
        res.json(data2);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.delete("/vacancy_internal_applicant", async (req, res, next) => {
    try {
        inputFilter({ id: "number" }, {}, req.body);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        res.json(await deleteFnInternal(req.body.id));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});

module.exports = router;
