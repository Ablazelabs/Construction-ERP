const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const uploadValidation = require("../../../validation/uploadValidation");
const validation = require("../../../validation/validation");
const { post, patch } = require("../../../services/fileEmployeeMasters");
const { renameSync, unlinkSync, mkdirSync, existsSync } = require("fs");
const employeeData = require("./hcmEmployeeMasters.json");
let stringInputFilters = {
    ...employeeData.allInputFilters.employee,
};
for (let i in stringInputFilters) {
    stringInputFilters[i] = "string";
}
const allInputFilters = {
    attachment: {},
    employee_attachment: {
        description: "string",
        employee_id: "string", //number
    },
    employee: stringInputFilters,
};
const realTypes = {
    attachment: {
        employee_id: "number",
        isProtectedForEdit: "boolean",
    },
    employee_attachment: {
        employee_id: "number",
        isProtectedForEdit: "boolean",
    },
    employee: {
        ...employeeData.allInputFilters.employee,
        ...employeeData.allOptionalInputFilters.employee,
    },
};
const enums = {
    employee: employeeData.enums.employee,
};
let stringOptionalInputFilters = {
    ...employeeData.allOptionalInputFilters.employee,
};
for (let i in stringOptionalInputFilters) {
    stringOptionalInputFilters[i] = "string";
}
const allOptionalInputfilters = {
    attachment: {
        description: "string",
        employee_id: "string", //number
    },
    employee: stringOptionalInputFilters,
    employee_attachment: {},
};
const phoneValues = {
    attachment: [],
    employee: employeeData.phoneValues.employee,
    employee_attachment: [],
};
const emailValues = {
    attachment: [],
    employee: employeeData.emailValues.employee,
    employee_attachment: [],
};
const dateValues = {
    attachment: [],
    employee: employeeData.dateValues.employee,
    employee_attachment: [],
};
const fileRequired = {
    attachment: true,
    employee: false,
    employee_attachment: false,
};
const allowedFileTypes = {
    attachment: ["pdf"],
    employee: ["jpg", "png", "jpeg"], //TODO add more image file types (this is enough tho)
    employee_attachment: ["pdf"],
};
const fileAttributes = {
    attachment: "path",
    employee: "photo",
    employee_attachment: "path",
};
const allRoutes = ["/attachment", "/employee", "/employee_attachment"];

const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const deleteUnusedFile = (file) => {
    try {
        if (file && file.path) unlinkSync(file.path);
    } catch {}
};
router.post(allRoutes, upload.single("file"), async (req, res, next) => {
    const operationDataType =
        req.path.split("/").pop() == ""
            ? "attachment"
            : req.path.split("/").pop();
    let reqBody;
    const requiredInputFilter = allInputFilters[operationDataType];
    const optionalInputFilter = allOptionalInputfilters[operationDataType];
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
            reqBody[fileAttributes[operationDataType]] = fileUrl;
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
        const data = await post(
            reqBody,
            operationDataType,
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
router.patch(allRoutes, upload.single("file"), async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    let updateData = {};
    try {
        if (!req.body.updateData) req.body.updateData = {};
        inputFilter({ id: "string", updateData: "object" }, {}, req.body);
        updateData = inputFilter(
            {},
            {
                ...allInputFilters[operationDataType],
                ...allOptionalInputfilters[operationDataType],
                isProtectedForEdit: "string",
            },
            req.body
        );
        req.body.id = Number(req.body.id);
        if (req.body.id > 0 || req.body.id < 0 || req.body.id === 0) {
        } else {
            throw { key: "id", message: "please send number" };
        }
        for (let i in realTypes[operationDataType]) {
            const type = realTypes[operationDataType][i];
            if (!updateData[i]) {
                continue;
            }
            if (type == "number") {
                updateData[i] = Number(updateData[i]);
                if (
                    updateData[i] > 0 ||
                    updateData[i] < 0 ||
                    updateData[i] === 0
                ) {
                } else {
                    throw { key: i, message: "please send number" };
                }
            } else if (type == "boolean") {
                if (updateData[i] === "false" || updateData[i] === "true") {
                    if (updateData[i] === "false") updateData[i] = false;
                    if (updateData[i] === "true") updateData[i] = true;
                } else {
                    throw { key: i, message: "please send boolean" };
                }
            }
        }
        // if date values sent in update data, transform them into a date value, if wrong format detected throw an error

        for (let i in dateValues[operationDataType]) {
            const key = dateValues[operationDataType][i];
            if (updateData[key]) {
                updateData[key] = new Date(updateData[key]);
                if (!updateData[key].getTime()) {
                    throw {
                        key: key,
                        message: "please send date in yyyy/mm/dd format",
                    };
                }
            }
        }
        for (let i in enums[operationDataType]) {
            const key = i;
            const myArray = enums[operationDataType][i];
            if (!updateData[key] && updateData[key] != 0) {
                continue;
            } else {
                if (updateData[key] < 1 || updateData[key] > myArray.length) {
                    throw {
                        key,
                        message: `please send a number between 1 and ${
                            myArray.length
                        }, as it identifies the following ${String(myArray)}`,
                    };
                } else {
                    updateData[key] = Math.floor(updateData[key]);
                }
            }
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        const fileIsGood = uploadValidation(
            req.file,
            allowedFileTypes[operationDataType],
            next,
            false
        );
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
            updateData[fileAttributes[operationDataType]] = fileUrl;
            if (operationDataType == "attachment") {
                updateData["name"] = req.file.filename;
                updateData["size"] = req.file.size;
                updateData["type"] = fileType;
            }
        }
    } catch {
        deleteUnusedFile(req.file);
        return;
    }
    if (Object.keys(updateData).length == 0) {
        error("updateData", "no data has been sent for update", next);
        return;
    }
    //if phone or email values given in update data validate it.
    for (let i in phoneValues[operationDataType]) {
        if (updateData[phoneValues[operationDataType][i]])
            if (
                !validation.checkPhoneNumber(
                    updateData[phoneValues[operationDataType][i]],
                    next
                )
            )
                return;
    }
    for (let i in emailValues[operationDataType]) {
        if (updateData[emailValues[operationDataType][i]])
            if (
                !validation.checkEmail(
                    updateData[emailValues[operationDataType][i]],
                    next
                )
            )
                return;
    }
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
            operationDataType,
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
        return;
    }
});
module.exports = router;
