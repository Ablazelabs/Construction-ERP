const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const uploadValidation = require("../../../validation/uploadValidation");
const validation = require("../../../validation/validation");
const { renameSync, unlinkSync, mkdirSync, existsSync } = require("fs");
const employeeMastersData = require("./hcmEmployeeMasters.json");
const { returnPatchData } = require("../../../validation/basicValidators");
let stringInputFilters = {
    ...employeeMastersData.allInputFilters.employee,
};
for (let i in stringInputFilters) {
    stringInputFilters[i] = "string";
}

let stringOrgInput = {
    ...employeeMastersData.allInputFilters.org_assignment,
};
for (let i in stringOrgInput) {
    stringOrgInput[i] = "string";
}

let stringActionInput = {
    ...employeeMastersData.allInputFilters.employee_action,
};
for (let i in stringActionInput) {
    stringActionInput[i] = "string";
}
delete stringActionInput.employee_id;
let allInputFilters = {
    employee: { ...stringInputFilters, startDate: "string", endDate: "string" },
    org_assignment: stringOrgInput,
    employee_action: stringActionInput,
};
allInputFilters.initial_hiring = {
    ...allInputFilters.employee,
    ...allInputFilters.org_assignment,
    ...allInputFilters.employee_action,
};
delete allInputFilters.initial_hiring.id_number;
let realTypes = {
    employee: {
        ...employeeMastersData.allOptionalInputFilters.employee,
        ...employeeMastersData.allInputFilters.employee,
        isProtectedForEdit: "boolean",
    },
    org_assignment: {
        ...employeeMastersData.allInputFilters.org_assignment,
        ...employeeMastersData.allOptionalInputFilters.org_assignment,
        isProtectedForEdit: "boolean",
    },
    employee_action: {
        ...employeeMastersData.allInputFilters.employee_action,
        ...employeeMastersData.allOptionalInputFilters.employee_action,
        isProtectedForEdit: "boolean",
    },
};
realTypes.initial_hiring = {
    ...realTypes.employee_action,
    ...realTypes.employee,
    ...realTypes.org_assignment,
    vacancy_applicant_id: "number",
};
let enums = {
    employee: employeeMastersData.enums.employee,
    org_assignment: employeeMastersData.enums.org_assignment,
    employee_action: employeeMastersData.enums.employee_action,
};
enums.initial_hiring = {
    ...enums.employee_action,
    ...enums.employee,
    ...enums.org_assignment,
};
let stringOptionalInputFilters = {
    ...employeeMastersData.allOptionalInputFilters.employee,
};
for (let i in stringOptionalInputFilters) {
    stringOptionalInputFilters[i] = "string";
}
let stringOptionalOrg = {
    ...employeeMastersData.allOptionalInputFilters.org_assignment,
};
for (let i in stringOptionalOrg) {
    stringOptionalOrg[i] = "string";
}
let stringOptionalAction = {
    ...employeeMastersData.allOptionalInputFilters.employee_action,
};
for (let i in stringOptionalAction) {
    stringOptionalAction[i] = "string";
}
let allOptionalInputFilters = {
    employee: stringOptionalInputFilters,
    org_assignment: stringOptionalOrg,
    employee_action: stringOptionalAction,
    id_number: "string",
};
// adding vacancy applicant id for the last operation
// Chnage application status if action is initiated from recruitment(there fore we need vacancy applicant id)
allOptionalInputFilters.initial_hiring = {
    ...allOptionalInputFilters.employee_action,
    ...allOptionalInputFilters.employee,
    ...allOptionalInputFilters.org_assignment,
    vacancy_applicant_id: "string",
};
let phoneValues = {
    employee: employeeMastersData.phoneValues.employee,
    org_assignment: employeeMastersData.phoneValues.org_assignment,
    employee_action: employeeMastersData.phoneValues.employee_action,
};
phoneValues.initial_hiring = {
    ...phoneValues.employee_action,
    ...phoneValues.employee,
    ...phoneValues.org_assignment,
};
let emailValues = {
    employee: employeeMastersData.emailValues.employee,
    org_assignment: employeeMastersData.emailValues.org_assignment,
    employee_action: employeeMastersData.emailValues.employee_action,
};
emailValues.initial_hiring = [
    ...emailValues.employee_action,
    ...emailValues.employee,
    ...emailValues.org_assignment,
];
let dateValues = {
    employee: employeeMastersData.dateValues.employee,
    org_assignment: employeeMastersData.dateValues.org_assignment,
    employee_action: employeeMastersData.dateValues.employee_action,
};
dateValues.initial_hiring = [
    ...dateValues.employee_action,
    ...dateValues.employee,
    ...dateValues.org_assignment,
    "startDate",
    "endDate",
];
const fileRequired = {
    initial_hiring: false,
};
const allowedFileTypes = ["jpg", "png", "jpeg"];
const allRoutes = ["/initial_hiring"];

const multer = require("multer");
const inititalHiring = require("../../../services/initialHiring");

const upload = multer({ dest: "uploads/" });
const deleteUnusedFile = (file) => {
    try {
        if (file && file.path) unlinkSync(file.path);
    } catch {}
};
router.post(allRoutes, upload.single("file"), async (req, res, next) => {
    const operationDataType = "initial_hiring";
    let reqBody;
    const requiredInputFilter = allInputFilters[operationDataType];
    const optionalInputFilter = allOptionalInputFilters[operationDataType];
    try {
        reqBody = inputFilter(
            {
                ...requiredInputFilter,
            },
            {
                isProtectedForEdit: "string",
                ...optionalInputFilter,
            },
            req.body
        );
        for (let i in realTypes[operationDataType]) {
            const type = realTypes[operationDataType][i];
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
        for (let i in dateValues[operationDataType]) {
            if (!reqBody[dateValues[operationDataType][i]]) {
                continue;
            }
            reqBody[dateValues[operationDataType][i]] = new Date(
                reqBody[dateValues[operationDataType][i]]
            );
            if (!reqBody[dateValues[operationDataType][i]].getTime()) {
                throw {
                    key: dateValues[operationDataType][i],
                    message: `please send date in yyyy/mm/dd format`,
                };
            }
        }
        for (let i in enums[operationDataType]) {
            const key = i;
            const myArray = enums[operationDataType][i];
            if (!reqBody[key] && reqBody[key] != 0) {
                continue;
            } else {
                if (reqBody[key] < 1 || reqBody[key] > myArray.length) {
                    throw {
                        key,
                        message: `please send a number between 1 and ${
                            myArray.length
                        }, as it identifies the following ${String(myArray)}`,
                    };
                } else {
                    reqBody[key] = Math.floor(reqBody[key]);
                }
            }
        }
    } catch (e) {
        error(e.key, e.key + " " + e.message, next, 400);
        deleteUnusedFile(req.file);
        return;
    }
    try {
        const fileIsGood = uploadValidation(
            req.file,
            allowedFileTypes,
            next,
            fileRequired[operationDataType]
        );
        if (fileIsGood) {
            let operationDataType = "employee";
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
            reqBody["logo"] = fileUrl;
        }
    } catch {
        deleteUnusedFile(req.file);
        return;
    }
    for (let i in phoneValues[operationDataType]) {
        if (reqBody[phoneValues[operationDataType][i]])
            if (
                !validation.checkPhoneNumber(
                    reqBody[phoneValues[operationDataType][i]],
                    next,
                    phoneValues[operationDataType][i]
                )
            )
                return;
    }
    for (let i in emailValues[operationDataType]) {
        if (reqBody[emailValues[operationDataType][i]])
            if (
                !validation.checkEmail(
                    reqBody[emailValues[operationDataType][i]],
                    next,
                    emailValues[operationDataType][i]
                )
            )
                return;
    }
    try {
        for (let i in dateValues["employee"]) {
            const key = dateValues["employee"][i];
            allInputFilters.employee[key] = undefined;
            allOptionalInputFilters.employee[key] = undefined;
            realTypes.employee[key] = undefined;
        }
        let employeeReqBody = inputFilter(
            {},
            {
                ...allInputFilters.employee,
                ...allOptionalInputFilters.employee,
                ...realTypes.employee,
                startDate: undefined,
                endDate: undefined,
            },
            reqBody
        );
        for (let i in dateValues["employee"]) {
            const key = dateValues["employee"][i];
            employeeReqBody[key] = reqBody[key];
        }
        employeeReqBody.startDate = reqBody.startDate;
        employeeReqBody.endDate = reqBody.endDate;
        for (let i in dateValues["org_assignment"]) {
            const key = dateValues["org_assignment"][i];
            allInputFilters.org_assignment[key] = undefined;
            allOptionalInputFilters.org_assignment[key] = undefined;
            realTypes.org_assignment[key] = undefined;
        }
        let orgAssignmentReqBody = inputFilter(
            {},
            {
                ...allInputFilters.org_assignment,
                ...allOptionalInputFilters.org_assignment,
                ...realTypes.org_assignment,
                startDate: undefined,
                endDate: undefined,
            },
            reqBody
        );
        for (let i in dateValues["org_assignment"]) {
            const key = dateValues["org_assignment"][i];
            orgAssignmentReqBody[key] = reqBody[key];
        }
        orgAssignmentReqBody.startDate = reqBody.startDate;
        orgAssignmentReqBody.endDate = reqBody.endDate;
        for (let i in dateValues["employee_action"]) {
            const key = dateValues["employee_action"][i];
            allInputFilters.employee_action[key] = undefined;
            allOptionalInputFilters.employee_action[key] = undefined;
            realTypes.employee_action[key] = undefined;
        }
        let employeeActionReqBody = inputFilter(
            {},
            {
                ...allInputFilters.employee_action,
                ...allOptionalInputFilters.employee_action,
                ...realTypes.employee_action,
                startDate: undefined,
                endDate: undefined,
            },
            reqBody
        );
        for (let i in dateValues["employee_action"]) {
            const key = dateValues["employee_action"][i];
            employeeActionReqBody[key] = reqBody[key];
        }
        employeeActionReqBody.startDate = reqBody.startDate;
        employeeActionReqBody.endDate = reqBody.endDate;

        if (reqBody.startDate > new Date()) {
            error("startDate", "can't be future date", next);
            return;
        }
        if (reqBody.employment_start_date) {
            if (reqBody.employment_start_date > new Date()) {
                error("employment_start_date", "can't be future date", next);
                return;
            }
        }
        if (reqBody.marital_since) {
            if (reqBody.marital_since > new Date()) {
                error("marital_since", "can't be future date", next);
                return;
            }
        }
        if (reqBody.date_of_birth) {
            const age =
                new Date().getFullYear() - reqBody.date_of_birth.getFullYear();
            if (age < 15 && age >= 100) {
                error(
                    "date_of_birth",
                    "Employee age must be between 15 and 100 years",
                    next
                );
                return;
            }
        }
        // console.log(
        //     { employeeReqBody },
        //     { orgAssignmentReqBody },
        //     { employeeActionReqBody },
        //     "------",
        //     reqBody
        // );
        // res.json({ done: "done" });
        // return;
        const data = await inititalHiring(
            {
                employeeReqBody,
                uniqueEmployee: employeeMastersData.uniqueValues.employee,
            },
            {
                orgAssignmentReqBody,
                uniqueOrg: employeeMastersData.uniqueValues.org_assignment,
            },
            {
                employeeActionReqBody,
                uniqueOrg: employeeMastersData.uniqueValues.employee_action,
            },
            reqBody,
            res.locals.id,
            next
        );
        if (!data) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch(allRoutes, async (req, res, next) => {
    const requiredInputFilter = {},
        optionalInputFilterEmployee = {
            startDate: "string",
            endDate: "string",
        },
        optionalInputFilterOrg = {
            job_title_id: "number",
            location_id: "number",
            business_unit_id: "number",
            employee_group_id: "number",
        },
        dateValue = ["startDate", "endDate"],
        myEnums = [],
        phoneValue = [],
        emailValue = [],
        rangeValues = [];

    const employeeData = returnPatchData(
        req.body,
        {
            requiredInputFilter,
            optionalInputFilter: optionalInputFilterEmployee,
            dateValue,
            myEnums,
            phoneValue,
            emailValue,
            rangeValues,
        },
        next
    );
    if (!employeeData) {
        return;
    }
    const orgData = returnPatchData(
        req.body,
        {
            requiredInputFilter,
            optionalInputFilter: optionalInputFilterOrg,
            dateValue,
            myEnums,
            phoneValue,
            emailValue,
            rangeValues,
        },
        next
    );
    if (!orgData) {
        return;
    }
    const {
        updateData: updateDataEmp,
        updateDataProjection: updateDataProjectionEmp,
    } = employeeData;
    const {
        updateData: updateDataOrg,
        updateDataProjection: updateDataProjectionOrg,
    } = orgData;
    try {
        const data = await patchLogic(
            req.body,
            updateDataEmp,
            updateDataProjectionEmp,
            updateDataOrg,
            updateDataProjectionOrg,
            res.locals.id,
            next
        );
        if (!data) {
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
