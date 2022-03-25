const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { patch, post } = require("../../../services/contact");

const {
    returnReqBody,
    returnPatchData,
} = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");
const allConfigs = require("./financemasters.json");
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
router.post("/contact", async (req, res, next) => {
    const contactData = {
        requiredInputFilter: allInputFilters["contact"],
        optionalInputFilter: allOptionalInputFilters["contact"],
        dateValue: dateValues["contact"],
        myEnums: enums["contact"],
        phoneValue: phoneValues["contact"],
        emailValue: emailValues["contact"],
        rangeValues: allRangeValues["contact"],
    };
    let contactAddressData = {
        requiredInputFilter: allInputFilters["contact_address"],
        optionalInputFilter: allOptionalInputFilters["contact_address"],
        dateValue: dateValues["contact_address"],
        myEnums: enums["contact_address"],
        phoneValue: phoneValues["contact_address"],
        emailValue: emailValues["contact_address"],
        rangeValues: allRangeValues["contact_address"],
    };
    delete contactAddressData.requiredInputFilter.contact_id;
    let contactPersonData = {
        requiredInputFilter: allInputFilters["contact_person"],
        optionalInputFilter: allOptionalInputFilters["contact_person"],
        dateValue: dateValues["contact_person"],
        myEnums: enums["contact_person"],
        phoneValue: phoneValues["contact_person"],
        emailValue: emailValues["contact_person"],
        rangeValues: allRangeValues["contact_person"],
    };
    delete contactPersonData.requiredInputFilter.contact_id;

    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                contactAddresses: "object",
                contactPersons: "object",
                contact: "object",
            },
            {},
            req.body
        );
        if (!Array.isArray(reqBody.contactAddresses)) {
            throw { key: "contactAddresses", message: "please send array" };
        }
        if (!reqBody.contactAddresses.length) {
            throw {
                key: "contactAddresses",
                message: "array can't be empty",
            };
        }
        if (!Array.isArray(reqBody.contactPersons)) {
            throw { key: "contactPersons", message: "please send array" };
        }
        if (!reqBody.contactPersons.length) {
            throw {
                key: "contactPersons",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { contactAddresses, contactPersons, contact } = reqBody;
    for (let i in contactAddresses) {
        contactAddresses[i] = returnReqBody(
            contactAddresses[i],
            contactAddressData,
            next
        );
        if (!contactAddresses[i]) {
            return;
        }
    }
    for (let i in contactPersons) {
        contactPersons[i] = returnReqBody(
            contactPersons[i],
            contactPersonData,
            next
        );
        if (!contactPersons[i]) {
            return;
        }
    }
    contact = returnReqBody(contact, contactData, next);
    if (!contact) {
        return;
    }
    try {
        const data = await post(
            { contact, contactAddresses, contactPersons },
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
router.patch("/contact", async (req, res, next) => {
    const contactData = {
        requiredInputFilter: allInputFilters["contact"],
        optionalInputFilter: allOptionalInputFilters["contact"],
        dateValue: dateValues["contact"],
        myEnums: enums["contact"],
        phoneValue: phoneValues["contact"],
        emailValue: emailValues["contact"],
        rangeValues: allRangeValues["contact"],
    };
    let contactAddressData = {
        requiredInputFilter: allInputFilters["contact_address"],
        optionalInputFilter: allOptionalInputFilters["contact_address"],
        dateValue: dateValues["contact_address"],
        myEnums: enums["contact_address"],
        phoneValue: phoneValues["contact_address"],
        emailValue: emailValues["contact_address"],
        rangeValues: allRangeValues["contact_address"],
    };
    delete contactAddressData.requiredInputFilter.contact_id;
    let contactPersonData = {
        requiredInputFilter: allInputFilters["contact_person"],
        optionalInputFilter: allOptionalInputFilters["contact_person"],
        dateValue: dateValues["contact_person"],
        myEnums: enums["contact_person"],
        phoneValue: phoneValues["contact_person"],
        emailValue: emailValues["contact_person"],
        rangeValues: allRangeValues["contact_person"],
    };
    delete contactPersonData.requiredInputFilter.contact_id;

    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                contactAddresses: "object",
                contactPersons: "object",
                contact: "object",
                id: "number",
            },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.contactAddresses)) {
            throw { key: "contactAddresses", message: "please send array" };
        }
        if (!reqBody.contactAddresses.length) {
            throw {
                key: "contactAddresses",
                message: "array can't be empty",
            };
        }
        if (!Array.isArray(reqBody.contactPersons)) {
            throw { key: "contactPersons", message: "please send array" };
        }
        if (!reqBody.contactPersons.length) {
            throw {
                key: "contactPersons",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { contactAddresses, contactPersons, contact } = reqBody;
    for (let i in contactAddresses) {
        contactAddresses[i] = returnReqBody(
            contactAddresses[i],
            contactAddressData,
            next
        );
        if (!contactAddresses[i]) {
            return;
        }
    }
    for (let i in contactPersons) {
        contactPersons[i] = returnReqBody(
            contactPersons[i],
            contactPersonData,
            next
        );
        if (!contactPersons[i]) {
            return;
        }
    }
    const { updateData, updateDataProjection } = returnPatchData(
        { id: req.body.id, updateData: contact },
        contactData,
        next
    );
    contact = updateData;
    if (!contact) {
        return;
    }
    try {
        const data = await patch(
            { contact, contactAddresses, contactPersons },
            req.body.id,
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
module.exports = router;
