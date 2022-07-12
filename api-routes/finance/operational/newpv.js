const express = require("express");
const multer = require("multer");
const router = express.Router();
const { error, getOperationDataType } = require("../../../config/config");
const upload = multer({ dest: "uploads/" });
const { renameSync, unlinkSync, existsSync, mkdirSync } = require("fs");
const {
    patchPaymentRequest,
    deleter,
    postPaymentRequest,
    postPettyCash,
    patchPettyCash,
    addAttachments,
    removeAttachment,
    addIdImagePayment,
    addIdImagePetty,
} = require("../../../services/newpv");

const {
    returnReqBody,
    returnPatchData,
} = require("../../../validation/basicValidators");

const allConfigs = require("./rest_finance_operational.json");
const uploadValidation = require("../../../validation/uploadValidation");
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

router.post("/payment_request", async (req, res, next) => {
    const operationDataType = "payment_request";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    let reqBody = returnReqBody(
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
        const data = await postPaymentRequest(
            reqBody,
            operationDataType,
            res.locals.id,
            [],
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
router.post("/petty_cash", async (req, res, next) => {
    console.log({ reqBody: req.body });
    const operationDataType = "petty_cash";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    let reqBody = returnReqBody(
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
        console.log(req.body, {
            requiredInputFilter,
            optionalInputFilter,
            dateValue,
            myEnums,
            phoneValue,
            emailValue,
            rangeValues,
        });
        return;
    }
    try {
        const data = await postPettyCash(
            reqBody,
            operationDataType,
            res.locals.id,
            next
        );
        if (data == false) {
            return;
        }
        if (data[0] == false) {
            return;
        }
        //I used promise.all to handle transaction decreasing remaining balance from payment request!
        res.json(data[0]);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/payment_request", async (req, res, next) => {
    const operationDataType = getOperationDataType(req.path);

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
        const data = await patchPaymentRequest(
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
router.patch("/petty_cash", async (req, res, next) => {
    const operationDataType = "petty_cash";

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
        const data = await patchPettyCash(
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
        if (data[0] === false) {
            return;
        }
        res.json(data[0]);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
router.post(
    "/payment_request/add_attachments",
    upload.any(),
    async (req, res, next) => {
        if (!req.body.id) {
            error("id", "please send id of the payment request", next);
            return;
        }
        const uploadTarget = "payment_request";
        try {
            let fileUrls = [];
            req.files = req.files.filter((elem) => elem.fieldname === "file[]");
            for (let i in req.files) {
                const reqFile = req.files[i];
                console.log(reqFile);
                try {
                    uploadValidation(
                        reqFile,
                        ["pdf", "jpeg", "jpg", "png", "docx", "doc"],
                        next,
                        true
                    );
                    const dir = `uploads/${uploadTarget}`;
                    if (!existsSync(dir)) {
                        mkdirSync(dir);
                    }
                    const fileType = reqFile.originalname.split(".").pop();
                    const newDestination = `uploads/${uploadTarget}/${reqFile.filename}.${fileType}`;
                    const fileName = reqFile.filename;
                    const fileUrl = `/uploads/${uploadTarget}/${fileName}.${fileType}`;
                    fileUrls.push(fileUrl);
                    renameSync(reqFile.path, newDestination);
                } catch (e) {
                    console.log(e);
                    unlinkSync(reqFile.path);
                }
            }
            const data = await addAttachments(
                Number(req.body.id),
                fileUrls,
                next
            );
            if (!data) {
                return;
            }
            return res.json(data);
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
            return;
        }
    }
);
router.delete("/payment_request/remove_attachment", async (req, res, next) => {
    if (isNaN(req.body.removedIndex)) {
        error(
            "removedIndex",
            "please send which index you want to remove",
            next
        );
        return;
    }
    if (!req.body.id) {
        error("id", "please send id of the payment request", next);
        return;
    }
    const data = await removeAttachment(
        req.body.id,
        req.body.removedIndex,
        next
    );
    if (!data) {
        return;
    } else return res.json(data);
});
/**
 * will also replace the id(use it as add or as patch)
 */
router.patch(
    "/payment_request/add_id",
    upload.single("file"),
    async (req, res, next) => {
        if (!req.body.id) {
            error("id", "please send id of the payment request", next);
            return;
        }
        const uploadTarget = "payment_request";
        try {
            let fileUrl = "";
            const reqFile = req.file;
            try {
                uploadValidation(
                    reqFile,
                    ["pdf", "jpeg", "jpg", "png", "docx", "doc"],
                    next,
                    true
                );
                const fileType = reqFile.originalname.split(".").pop();
                const dir = `uploads/${uploadTarget}`;
                if (!existsSync(dir)) {
                    mkdirSync(dir);
                }
                const newDestination = `uploads/${uploadTarget}/${reqFile.filename}.${fileType}`;
                const fileName = reqFile.filename;
                fileUrl = `/uploads/${uploadTarget}/${fileName}.${fileType}`;
                renameSync(reqFile.path, newDestination);
            } catch (e) {
                unlinkSync(reqFile.path);
            }

            const data = await addIdImagePayment(
                Number(req.body.id),
                fileUrl,
                next
            );
            if (!data) {
                return;
            }
            return res.json(data);
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
            return;
        }
    }
);
/**
 * will also replace the id(use it as add or as patch)
 */
router.patch(
    "/petty_cash/add_id",
    upload.single("file"),
    async (req, res, next) => {
        if (!req.body.id) {
            error("id", "please send id of the payment request", next);
            return;
        }
        const uploadTarget = "payment_request";
        try {
            let fileUrl = [];

            const reqFile = req.file;
            try {
                uploadValidation(
                    reqFile,
                    ["pdf", "jpeg", "jpg", "png", "docx", "doc"],
                    next,
                    true
                );
                const dir = `uploads/${uploadTarget}`;
                if (!existsSync(dir)) {
                    mkdirSync(dir);
                }
                const fileType = reqFile.originalname.split(".").pop();
                const newDestination = `uploads/${uploadTarget}/${req.file.filename}.${fileType}`;
                const fileName = reqFile.filename;
                const fileUrl = `/uploads/${uploadTarget}/${fileName}.${fileType}`;
                fileUrl = fileUrl;
                renameSync(reqFile.path, newDestination);
            } catch (e) {
                unlinkSync(reqFile.path);
            }

            const data = await addIdImagePetty(req.body.id, fileUrl, next);
            if (!data) {
                return;
            }
            return res.json(data);
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
            return;
        }
    }
);

module.exports = router;
