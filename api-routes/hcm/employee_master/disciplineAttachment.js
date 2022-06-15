const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const uploadValidation = require("../../../validation/uploadValidation");
const validation = require("../../../validation/validation");
const { post } = require("../../../services/fileEmployeeMasters");
const {
    post: disciplinePost,
} = require("../../../services/hcmEmployeeMasters");
const { renameSync, unlinkSync, mkdirSync, existsSync } = require("fs");
const disciplineData = require("./hcmEmployeeMasters.json");
let stringInputFilters = { ...disciplineData.allInputFilters.discipline };
for (let i in stringInputFilters) {
    stringInputFilters[i] = "string";
}
let allInputFilters = {
    discipline: stringInputFilters,
    attachment: {},
};
allInputFilters.discipline_attachment = {
    ...allInputFilters.attachment,
    ...allInputFilters.discipline,
};
let realTypes = {
    discipline: {
        ...disciplineData.allOptionalInputFilters.discipline,
        ...disciplineData.allInputFilters.discipline,
        isProtectedForEdit: "boolean",
    },
    attachment: {
        employee_id: "number",
        isProtectedForEdit: "boolean",
    },
};
realTypes.discipline_attachment = {
    ...realTypes.attachment,
    ...realTypes.discipline,
};
let enums = {
    discipline: disciplineData.enums.discipline,
};
enums.discipline_attachment = {
    ...enums.attachment,
    ...enums.discipline,
};
let allOptionalInputFilters = {
    discipline: {
        attachment_id: "string",
        case_type_id: "string",
    },
    attachment: {
        description: "string",
        employee_id: "string", //number
    },
};
allOptionalInputFilters.discipline_attachment = {
    ...allOptionalInputFilters.attachment,
    ...allOptionalInputFilters.discipline,
};
let phoneValues = {
    discipline: disciplineData.phoneValues.discipline,
    attachment: [],
};
phoneValues.discipline_attachment = {
    ...phoneValues.attachment,
    ...phoneValues.discipline,
};
let emailValues = {
    discipline: disciplineData.emailValues.discipline,
    attachment: [],
};
emailValues.discipline_attachment = {
    ...emailValues.attachment,
    ...emailValues.discipline,
};
let dateValues = {
    discipline: disciplineData.dateValues.discipline,
    attachment: [],
};
dateValues.discipline_attachment = {
    ...dateValues.attachment,
    ...dateValues.discipline,
};
const fileRequired = {
    discipline_attachment: false,
};
const allowedFileTypes = {
    discipline_attachment: ["pdf"],
};
const allRoutes = "/discipline";

const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const deleteUnusedFile = (file) => {
    try {
        if (file && file.path) unlinkSync(file.path);
    } catch {}
};
router.post(allRoutes, upload.single("file"), async (req, res, next) => {
    const operationDataType = "discipline_attachment";
    let reqBody;
    const requiredInputFilter = allInputFilters[operationDataType];
    const optionalInputFilter = allOptionalInputFilters[operationDataType];
    try {
        reqBody = inputFilter(
            {
                ...requiredInputFilter,
            },
            { isProtectedForEdit: "string", ...optionalInputFilter },
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
        reqBody.startDate = new Date();
        reqBody.endDate = new Date("9999/12/31");
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
        let disciplineReqBody = inputFilter(
            {},
            {
                ...allInputFilters.discipline,
                ...allOptionalInputFilters.discipline,
                ...realTypes.discipline,
            },
            reqBody
        );
        disciplineReqBody.endDate = reqBody.endDate;
        disciplineReqBody.startDate = reqBody.startDate;
        const data = await disciplinePost(
            disciplineReqBody,
            "discipline",
            res.locals.id,
            disciplineData.uniqueValues.discipline,
            next
        );
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
module.exports = router;
