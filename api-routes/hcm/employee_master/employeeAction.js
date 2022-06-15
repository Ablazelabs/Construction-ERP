const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const uploadValidation = require("../../../validation/uploadValidation");
const validation = require("../../../validation/validation");
const { post } = require("../../../services/fileEmployeeMasters");
const { post: normalPost } = require("../../../services/hcmEmployeeMasters");
const {
    patch: vacancyPatch,
} = require("../../../services/jobPosCompStrucRecru");
const { renameSync, unlinkSync, mkdirSync, existsSync } = require("fs");
const employeeActionData = require("./hcmEmployeeMasters.json");
const {
    postLogic: deletePreviousEA,
    patchLogic,
} = require("../../../services/employeeAction");
const { returnPatchData } = require("../../../validation/basicValidators");
let stringInputFilters = {
    ...employeeActionData.allInputFilters.employee_action,
};
for (let i in stringInputFilters) {
    stringInputFilters[i] = "string";
}

let stringOrgInput = {
    ...employeeActionData.allInputFilters.org_assignment,
};
for (let i in stringOrgInput) {
    stringOrgInput[i] = "string";
}

let allInputFilters = {
    employee_action: stringInputFilters,
    attachment: {},
    org_assignment: stringOrgInput,
};
allInputFilters.employee_action_attachment = {
    ...allInputFilters.attachment,
    ...allInputFilters.employee_action,
    ...allInputFilters.org_assignment,
};
let realTypes = {
    employee_action: {
        ...employeeActionData.allOptionalInputFilters.employee_action,
        ...employeeActionData.allInputFilters.employee_action,
        isProtectedForEdit: "boolean",
    },
    org_assignment: {
        ...employeeActionData.allInputFilters.org_assignment,
        ...employeeActionData.allOptionalInputFilters.org_assignment,
        isProtectedForEdit: "boolean",
    },
    attachment: {
        employee_id: "number",
        isProtectedForEdit: "boolean",
    },
};
realTypes.employee_action_attachment = {
    ...realTypes.attachment,
    ...realTypes.employee_action,
    ...realTypes.org_assignment,
    vacancy_applicant_id: "number",
};
let enums = {
    employee_action: employeeActionData.enums.employee_action,
    org_assignment: employeeActionData.enums.org_assignment,
};
enums.employee_action_attachment = {
    ...enums.attachment,
    ...enums.employee_action,
    ...enums.org_assignment,
};
let stringOptionalInputFilters = {
    ...employeeActionData.allOptionalInputFilters.employee_action,
};
for (let i in stringOptionalInputFilters) {
    stringOptionalInputFilters[i] = "string";
}
let stringOptionalOrg = {
    ...employeeActionData.allOptionalInputFilters.org_assignment,
};
for (let i in stringOptionalOrg) {
    stringOptionalOrg[i] = "string";
}
let allOptionalInputFilters = {
    employee_action: {
        ...stringOptionalInputFilters,
    },
    org_assignment: {
        ...stringOptionalOrg,
    },
    attachment: {
        description: "string",
        employee_id: "string", //number
    },
};
// adding vacancy applicant id for the last operation
// Chnage application status if action is initiated from recruitment(there fore we need vacancy applicant id)
allOptionalInputFilters.employee_action_attachment = {
    ...allOptionalInputFilters.attachment,
    ...allOptionalInputFilters.employee_action,
    ...allOptionalInputFilters.org_assignment,
    vacancy_applicant_id: "string",
};
let phoneValues = {
    employee_action: employeeActionData.phoneValues.employee_action,
    org_assignment: employeeActionData.phoneValues.org_assignment,
    attachment: [],
};
phoneValues.employee_action_attachment = {
    ...phoneValues.attachment,
    ...phoneValues.employee_action,
    ...phoneValues.org_assignment,
};
let emailValues = {
    employee_action: employeeActionData.emailValues.employee_action,
    org_assignment: employeeActionData.emailValues.org_assignment,
    attachment: [],
};
emailValues.employee_action_attachment = {
    ...emailValues.attachment,
    ...emailValues.employee_action,
    ...emailValues.org_assignment,
};
let dateValues = {
    employee_action: employeeActionData.dateValues.employee_action,
    org_assignment: employeeActionData.dateValues.org_assignment,
    attachment: [],
};
dateValues.employee_action_attachment = {
    ...dateValues.attachment,
    ...dateValues.employee_action,
    ...dateValues.org_assignment,
};
const fileRequired = {
    employee_action_attachment: false,
};
const allowedFileTypes = {
    employee_action_attachment: ["pdf"],
};
const allRoutes = ["/employee_action"];

const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const deleteUnusedFile = (file) => {
    try {
        if (file && file.path) unlinkSync(file.path);
    } catch {}
};
router.post(allRoutes, upload.single("file"), async (req, res, next) => {
    const operationDataType = "employee_action_attachment";
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
            req.body,
            1
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
                    message: "please send date in yyyy/mm/dd format",
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
        error(e.key, e.message, next, 400);
        deleteUnusedFile(req.file);
        return;
    }
    try {
        const fileIsGood = uploadValidation(
            req.file,
            allowedFileTypes[operationDataType],
            next,
            fileRequired[operationDataType]
        );
        if (!fileIsGood && fileRequired[operationDataType]) {
            deleteUnusedFile(req.file);
            return;
        }
        if (fileIsGood) {
            let operationDataType = "attachment";
            const fileType = req.file.originalname.split(".").pop();
            const newDestination = `uploads/${operationDataType}/${req.file.filename}.${fileType}`;
            const fileUrl = `/uploads/${operationDataType}/${req.file.filename}.${fileType}`;
            try {
                const dir = `uploads/${operationDataType}`;
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
            reqBody["path"] = fileUrl;
            if (operationDataType == "attachment") {
                reqBody["name"] = req.file.filename;
                reqBody["size"] = req.file.size;
                reqBody["type"] = fileType;
            }
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
        if (reqBody["path"]) {
            let attachmentInputFilter = { ...allInputFilters.attachment };
            attachmentInputFilter["path"] = "string";
            attachmentInputFilter["name"] = "string";
            attachmentInputFilter["size"] = "number";
            attachmentInputFilter["type"] = "string";
            let attachmentReqBody = inputFilter(
                {},
                {
                    ...attachmentInputFilter,
                    ...allOptionalInputFilters.attachment,
                    ...realTypes.attachment,
                },
                reqBody
            );
            attachmentReqBody.endDate = reqBody.endDate;
            attachmentReqBody.startDate = reqBody.startDate;
            const data = await post(
                attachmentReqBody,
                "attachment",
                res.locals.id,
                next,
                true
            );
            if (data == false) {
                return;
            }
            reqBody.attachment_id = data.id;
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
        employeeActionReqBody.startDate = reqBody.startDate;
        employeeActionReqBody.endDate = reqBody.endDate;
        let orgAssignmentReqBody = inputFilter(
            {},
            {
                ...allInputFilters.org_assignment,
                ...allOptionalInputFilters.org_assignment,
                ...realTypes.org_assignment,
            },
            reqBody
        );
        orgAssignmentReqBody.startDate = reqBody.startDate;
        orgAssignmentReqBody.endDate = reqBody.endDate;
        // business logic here
        try {
            const logicDone = await deletePreviousEA(employeeActionReqBody);
            if (!logicDone) {
                return;
            }
        } catch (e) {
            console.log("business logic failed", e);
            return;
        }
        const EA = await normalPost(
            employeeActionReqBody,
            "employee_action",
            res.locals.id,
            employeeActionData.uniqueValues.employee_action,
            next,
            true
        );
        if (!EA) {
            return;
        }
        orgAssignmentReqBody.employee_action_id = EA.id;

        let success = await normalPost(
            orgAssignmentReqBody,
            "org_assignment",
            res.locals.id,
            employeeActionData.uniqueValues.org_assignment,
            next
        );
        if (!success) {
            return;
        }
        if (reqBody.vacancy_applicant_id) {
            success = await vacancyPatch(
                { application_status: true },
                { id: reqBody.vacancy_applicant_id },
                { application_status: 4 },
                "vacancy_applicant",
                res.locals.id,
                require("../jobPosCompStrucRecru/jobPosCompStrucRecru.json")
                    .uniqueValues.vacancy_applicant,
                next
            );
            if (!success) {
                return;
            }
        }
        res.json({ success: true });
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
