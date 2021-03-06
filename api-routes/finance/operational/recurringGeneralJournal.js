const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const {
    createRecurring,
    taxInfoDetailForDisplay,
} = require("../../../services/recurringGeneralJournal");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const allConfigs = require("./rest_finance_operational.json");
const {
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
} = allConfigs;

router.post("/create_recurring", async (req, res, next) => {
    let reqBody = {};
    let generalJournalHeaderData = {
        requiredInputFilter: allInputFilters["general_journal_header"],
        optionalInputFilter: {
            ...allOptionalInputFilters["general_journal_header"],
            isCashBasedJournal: "boolean",
        },
        dateValue: dateValues["general_journal_header"],
        myEnums: enums["general_journal_header"],
        phoneValue: phoneValues["general_journal_header"],
        emailValue: emailValues["general_journal_header"],
        rangeValues: allRangeValues["general_journal_header"],
    };
    delete generalJournalHeaderData.requiredInputFilter.journal_date;
    const recurringJournalData = {
        requiredInputFilter: allInputFilters["recurring_general_journal"],
        optionalInputFilter:
            allOptionalInputFilters["recurring_general_journal"],
        dateValue: dateValues["recurring_general_journal"],
        myEnums: enums["recurring_general_journal"],
        phoneValue: phoneValues["recurring_general_journal"],
        emailValue: emailValues["recurring_general_journal"],
        rangeValues: allRangeValues["recurring_general_journal"],
    };
    let generalJournalDetailData = {
        requiredInputFilter: {
            ...allInputFilters["general_journal_detail"],
            tax_category: "number",
        },
        optionalInputFilter: allOptionalInputFilters["general_journal_detail"],
        dateValue: dateValues["general_journal_detail"],
        myEnums: enums["general_journal_detail"],
        phoneValue: phoneValues["general_journal_detail"],
        emailValue: emailValues["general_journal_detail"],
        rangeValues: allRangeValues["general_journal_detail"],
    };
    delete generalJournalDetailData.requiredInputFilter
        .general_journal_header_id;
    try {
        reqBody = inputFilter(
            {
                generalJournalHeader: "object",
                recurringJournal: "object",
                generalJournalDetail: "object",
            },
            {},
            req.body
        );
        if (!Array.isArray(reqBody.generalJournalDetail)) {
            throw { key: "generalJournalDetail", message: "please send array" };
        }
        if (!reqBody.generalJournalDetail.length) {
            throw {
                key: "generalJournalDetail",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { generalJournalHeader, recurringJournal, generalJournalDetail } =
        reqBody;

    for (let i in generalJournalDetail) {
        generalJournalDetail[i] = returnReqBody(
            generalJournalDetail[i],
            generalJournalDetailData,
            next
        );
        if (!generalJournalDetail[i]) {
            return;
        }
    }
    generalJournalHeader = returnReqBody(
        generalJournalHeader,
        generalJournalHeaderData,
        next
    );
    if (!generalJournalHeader) {
        return;
    }
    recurringJournal = returnReqBody(
        recurringJournal,
        recurringJournalData,
        next
    );
    if (!recurringJournal) {
        return;
    }
    try {
        const data = await createRecurring(
            generalJournalHeader,
            recurringJournal,
            generalJournalDetail,
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
router.get("/tax_info_detail", async (req, res, next) => {
    let reqBody = {};
    const taxInfoData = {
        requiredInputFilter: {
            taxName: "string",
            taxPercentage: "number",
            amountCredit: "number",
            amountDebit: "number",
            isGroupTax: "boolean",
        },
        optionalInputFilter: { taxId: "number" },
        dateValue: [],
        myEnums: {},
        phoneValue: [],
        emailValue: [],
        rangeValues: {},
    };
    try {
        reqBody = inputFilter(
            {
                taxInfo: "object",
            },
            {},
            req.body
        );
        if (!Array.isArray(reqBody.taxInfo)) {
            throw { key: "taxInfo", message: "please send array" };
        }
        if (!reqBody.taxInfo.length) {
            throw {
                key: "taxInfo",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { taxInfo } = reqBody;
    for (let i in taxInfo) {
        taxInfo[i] = returnReqBody(taxInfo[i], taxInfoData, next);
        if (!taxInfo[i]) {
            return;
        }
    }
    try {
        const data = await taxInfoDetailForDisplay(taxInfo);
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
