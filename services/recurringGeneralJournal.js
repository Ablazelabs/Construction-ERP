const { allModels } = require("../config/config");

const {
    accounting_period,
    general_journal_header,
    currency,
    recurring_journal_occurrence,
    number_tracker,
    tax_group,
    tax,
    associated_tax_group,
} = allModels;

/**
 *
 * @param {{
 *  posting_reference: string,
 *  journal_date: Date,
 *  notes: string,
 *  currency_id: number,
 *  posting_responsible_user_id: number,
 *  reference_number: string,
 *  journal_status: number,
 *  report_basis: number,
 *  journal_source: number,
 *  journal_posting_status: number,
 *  journal_type_reference: string,
 *  total_amount: number,
 *  journal_type_id: number,
 *  recurring_general_journal_id: number,
 *  startDate:Date,
 *  endDate:Date,
 *  isCashBasedJournal:boolean
 * }} generalJournalHeader
 * @param {{
 *  profile_name: string,
 *  start_on: Date,
 *  end_on: Date,
 *  never_expires: boolean,
 *  depreciable_value: number,
 *  recurring_general_journal_status: number,
 *  asset_id: number,
 *  recurring_journal_occurrence_id: number,
 *  startDate:Date,
 *  endDate:Date,
 *  }} recurringJournal
 * @param {Array<{
 *  debit_or_credit: number,
 *  reference_code: string,
 *  general_journal_header_id: number,
 *  cost_center_id: number,
 *  chart_of_account_id: number,
 *  description: string,
 *  tax_group_id: number,
 *  amount_credit: number,
 *  amount_debit: number,
 *  tax_id: number,
 *  contact_id: number,
 *  startDate:Date,
 *  endDate:Date,
 *  tax_category:1|2
 * }>} generalJournalDetail
 * @param {Array<{
 *  seNum: number,
 *  id: number,
 *  taxName: string,
 *  taxCategory: string,
 *  taxPercentage: number,
 * }>} taxViewModel
 * @param {number} creator
 * @param {Function} next
 */
const createRecurring = async (
    generalJournalHeader,
    recurringJournal,
    generalJournalDetail,
    creator,
    next
) => {
    const defaultValues = {
        createdBy: String(creator),
        revisedBy: String(creator),
    };
    const accountingPeriod = (
        await accounting_period.findMany({
            where: {
                accounting_period_status: 1,
            },
        })
    ).find(
        (elem) =>
            elem.period_starting_date.getMonth() ===
                recurringJournal.start_on.getMonth() &&
            elem.period_starting_date.getFullYear() ===
                recurringJournal.start_on.getFullYear
    );
    const generalJournalHeaderInUse = await general_journal_header.findFirst({
        where: {
            posting_reference: generalJournalHeader.posting_reference,
        },
    });
    if (generalJournalHeaderInUse) {
        error(
            "generalJournalHeader",
            "Posting pereference is already in use. Please communicate system administrator.",
            next
        );
        return false;
    }
    if (recurringJournal.never_expires) {
        recurringJournal.end_on = recurringJournal.endDate;
    }
    let journalComments = [];
    const journalCurrency = await currency.findUnique({
        where: { id: generalJournalHeader.currency_id },
    });

    sum = 0;
    generalJournalDetail.forEach(({ amount_credit }) => {
        sum += amount_credit;
    });
    journalComments.push({
        comment:
            " Recurring journal created for " + journalCurrency.currency_code ||
            "" + sum,
        commented_date: new Date(),
        application_user_id: creator,
    });
    const recurringJournalOccurrence =
        await recurring_journal_occurrence.findUnique({
            where: {
                id: recurringJournal.recurring_journal_occurrence_id,
            },
        });
    if (generalJournalHeader.journal_date < new Date()) {
        generalJournalHeader.journal_posting_status = 3;
        if (recurringJournalOccurrence?.repeat_every_label === 1) {
            generalJournalHeader.journal_date = new Date();
            generalJournalHeader.journal_date.setDate(
                new Date().getDate() +
                    recurringJournalOccurrence.repeat_every_number
            );
        } else if (recurringJournalOccurrence?.repeat_every_label === 2) {
            generalJournalHeader.journal_date = new Date();
            generalJournalHeader.journal_date.setDate(
                new Date().getDate() +
                    recurringJournalOccurrence.repeat_every_number * 7
            );
        } else if (recurringJournalOccurrence?.repeat_every_label === 3) {
            generalJournalHeader.journal_date = new Date();
            generalJournalHeader.journal_date.setMonth(
                new Date().getMonth() +
                    recurringJournalOccurrence.repeat_every_number
            );
        } else {
            generalJournalHeader.journal_date = new Date();
            generalJournalHeader.journal_date.setFullYear(
                new Date().getFullYear() +
                    recurringJournalOccurrence.repeat_every_number
            );
        }
    } else if (
        generalJournalHeader.journal_date > new Date() ||
        accountingPeriod
    ) {
        generalJournalHeader.journal_posting_status = 3;
    } else {
        generalJournalHeader.journal_posting_status = 2;
        journalComments.push({
            comment:
                " Journal created - " +
                generalJournalHeader.posting_reference +
                ". Saved as draft.",
            commented_date: new Date(),
            application_user_id: creator,
        });
    }
    if (generalJournalHeader.journal_posting_status === 1) {
        generalJournalHeader.posting_responsible_user_id = creator;
    } else {
        //whatever the frontend gave stays
    }
    let totalAmount = 0;
    let count = 0;
    let generalLedgers = [];

    for (let i in generalJournalDetail) {
        const detail = generalJournalDetail[i];
        if (detail) {
            totalAmount += detail.amount_credit;
            let percentage = 0;
            if (detail.tax_category == 1) {
                percentage = (
                    await tax.findUnique({
                        where: { id: detail.tax_id },
                        select: { tax_percentage: true },
                    })
                )?.tax_percentage;
            } else {
                percentage = (
                    await tax_group.findUnique({
                        where: { id: detail.tax_id },
                        select: { tax_group_percentage: true },
                    })
                )?.tax_group_percentage;
            }
            const tempTaxViewModel = {
                id: detail.tax_id,
                taxCategory: detail.tax_category,
                taxPercentage: percentage,
            };
            delete generalJournalDetail[i].tax_category;
            //we feed this object to prisma so, add what needs to be added here except for revised by and created by and the header foreign key id
            generalJournalDetail[i].posting_reference =
                generalJournalHeader.posting_reference + " - " + count;
            if (tempTaxViewModel) {
                if (tempTaxViewModel.taxCategory == 1) {
                    //id is aleady detail's id(talking about c#)
                    generalJournalDetail[i].tax_id = tempTaxViewModel.id;
                    generalJournalDetail[i].tax_group_id = undefined;
                    totalAmount +=
                        (detail.amount_credit *
                            tempTaxViewModel.taxPercentage) /
                        100;
                } else {
                    const associatedTaxes = (
                        await tax_group.findUnique({
                            where: { id: tempTaxViewModel.id },
                            select: {
                                associated_tax_group: { select: { tax: true } },
                            },
                        })
                    )?.associated_tax_group.map((elem) => elem.tax);
                    generalJournalDetail[i].tax_id = undefined;
                    generalJournalDetail[i].tax_group_id = tempTaxViewModel.id;
                    const withHoldingTax = await tax.findFirst({
                        where: {
                            tax_name: {
                                startsWith: "Withholding",
                                endsWith: "Withholding",
                            },
                        },
                    });
                    const vatTax = await tax.findFirst({
                        where: {
                            tax_name: {
                                startsWith: "VAT",
                                endsWith: "VAT",
                            },
                        },
                    });
                    let amountWithholding = 0;
                    let amountWithVat = 0;
                    let vatTaxFound = 0;
                    for (let k in associatedTaxes) {
                        const taxRelated = associatedTaxes[k];
                        if (withHoldingTax.id == taxRelated.id) {
                            amountWithholding =
                                (detail.amount_credit *
                                    taxRelated.tax_percentage) /
                                100;
                        }
                        if (vatTax.id == taxRelated.id) {
                            vatTaxFound = true;
                        } else {
                            totalAmount +=
                                (detail.amount_credit *
                                    taxRelated.tax_percentage) /
                                100;
                        }
                    }
                    if (vatTaxFound) {
                        amountWithVat =
                            ((amountWithWithHolding + detail.amount_credit) *
                                vatTax.tax_percentage) /
                            100;
                    }
                    totalAmount += amountWithVat;
                }
            }
            if (generalJournalHeader.journal_posting_status == 1) {
                generalLedgers.push({
                    chart_of_account_id:
                        generalJournalDetail[i].chart_of_account_id,
                    amount_credit: generalJournalDetail[i].amount_credit,
                    amount_debit: generalJournalDetail[i].amount_debit,
                    ledger_status: 1,
                    tax_id: generalJournalDetail[i].tax_id,
                    tax_group_id: generalJournalDetail[i].tax_group_id,
                    posting_reference:
                        generalJournalDetail[i].posting_reference,
                    group_posting_reference:
                        generalJournalHeader.posting_reference,
                    currency_id: generalJournalHeader.currency_id,
                    description: generalJournalHeader.notes,
                    journal_date: generalJournalHeader.journal_date,
                    posting_date: new Date(),
                    startDate: generalJournalDetail[i].startDate,
                    endDate: generalJournalDetail[i].endDate,
                });
            }
            count++;
        }
    }
    const jouralHeaderComment = {
        comment:
            "Journal created from the recurring journal - " +
            recurringJournal.profile_name +
            ". Saved as draft. ",
        commented_date: new Date(),
        application_user_id: creator,
    };
    generalJournalHeader.journal_date = recurringJournal.start_on;
    generalJournalHeader.report_basis = generalJournalHeader.isCashBasedJournal
        ? 2
        : 1;
    generalJournalHeader.journal_posting_status = 2;

    await general_journal_header.create({
        data: {
            ...generalJournalHeader,
            ...defaultValues,
            recurring_general_journal: {
                create: {
                    ...defaultValues,
                    ...recurringJournal,
                    journal_comment: {
                        createMany: {
                            data: journalComments.map((elem) => {
                                return { ...elem, ...defaultValues };
                            }),
                            skipDuplicates: true,
                        },
                    },
                },
            },
            journal_comment: {
                create: {
                    ...jouralHeaderComment,
                    ...defaultValues,
                },
            },
            general_journal_detail: {
                createMany: {
                    skipDuplicates: true,
                    data: generalJournalDetail.map((elem) => {
                        return { ...elem, ...defaultValues };
                    }),
                },
            },
            general_ledger: {
                createMany: {
                    skipDuplicates: true,
                    data: generalLedgers.map((elem) => {
                        return { ...elem, ...defaultValues };
                    }),
                },
            },
        },
    });
    const numberTrackerDetail = await number_tracker.findFirst({
        where: { reason: 2 }, //general journal detail(in enums)
    });
    const numberTrackerHeader = await number_tracker.findFirst({
        where: { reason: 1 },
    });
    await number_tracker.update({
        where: {
            id: numberTrackerDetail.id,
        },
        data: {
            next_number: {
                increment: count,
            },
            revisedBy: String(creator),
        },
    });
    await number_tracker.update({
        where: {
            id: numberTrackerHeader.id,
        },
        data: {
            next_number: {
                increment: 1,
            },
            revisedBy: String(creator),
        },
    });
    return { success: true };
};
/**
 *
 * @param {Array<{
 *  taxId:number
 *  taxName:string
 *  taxPercentage:number
 *  amountCredit:number
 *  amountDebit:number
 *  isGroupTax:boolean
 * }>} taxInfo
 */
const taxInfoDetailForDisplay = async (taxInfo) => {
    let taxInfoToDisplay = [];
    let subTotalCredit = 0,
        subTotalDebit = 0;

    const withHoldingTax = await tax.findFirst({
        where: {
            tax_name: {
                startsWith: "Withholding",
                endsWith: "Withholding",
            },
        },
    });
    const vatTax = await tax.findFirst({
        where: {
            tax_name: {
                startsWith: "VAT",
                endsWith: "VAT",
            },
        },
    });
    let amountWithWithHoldingCredit = 0,
        amountWithWithHoldingDedit = 0;
    let totalDebit = 0,
        totalCredit = 0;
    let vatTaxFound = false;

    const currencyCode = (
        await currency.findFirst({ where: { is_base_currency: true } })
    )?.currency_code;
    for (let i in taxInfo) {
        const taxInfoI = taxInfo[i];
        subTotalCredit += taxInfoI.amountCredit;
        subTotalDebit += taxInfoI.amountDebit;
        if (taxInfoI.taxId) {
            if (!taxInfoI.isGroupTax) {
                const taxDetail = await tax.findUnique({
                    where: { id: taxInfoI.taxId },
                });
                if (!taxInfoToDisplay.find((t) => t.taxId == taxInfoI.taxId))
                    taxInfoToDisplay.push({
                        taxId: taxDetail.id,
                        taxPercentage: taxDetail.tax_percentage,
                        taxName: taxDetail.tax_name,
                        amountCredit:
                            (taxInfoI.amountCredit * taxDetail.tax_percentage) /
                            100,
                        amountDebit:
                            (taxInfoI.amountDebit * taxDetail.tax_percentage) /
                            100,
                    });
                else {
                    taxInfoToDisplay.find(
                        (t) => t.taxId == taxInfoI.taxId
                    ).amountCredit +=
                        (taxInfoI.amountCredit * taxDetail.tax_percentage) /
                        100;
                    taxInfoToDisplay.find(
                        (t) => t.taxId == taxInfoI.taxId
                    ).amountDebit +=
                        (taxInfoI.amountDebit * taxDetail.tax_percentage) / 100;
                }
            } else {
                const associatedTaxGroup = await associated_tax_group.findMany({
                    where: { tax_group_id: taxInfoI.taxId },
                    include: { tax: true, tax_group: true },
                });
                for (let k in associatedTaxGroup) {
                    const assGroup = associatedTaxGroup[k];
                    if (withHoldingTax.id == assGroup.tax_id) {
                        amountWithWithHoldingCredit =
                            (taxInfoI.amountCredit *
                                assGroup.tax.tax_percentage) /
                            100;
                        amountWithWithHoldingDedit =
                            (taxInfoI.amountDebit *
                                assGroup.tax.tax_percentage) /
                            100;
                        totalCredit = amountWithWithHoldingCredit;
                        totalDebit = amountWithWithHoldingDedit;
                    }
                    if (vatTax.id == assGroup.tax_id) {
                        vatTaxFound = true;
                        continue;
                    } else {
                        totalCredit =
                            (taxInfoI.amountCredit *
                                assGroup.tax.tax_percentage) /
                            100;
                        totalDebit =
                            (taxInfoI.amountDebit *
                                assGroup.tax.tax_percentage) /
                            100;
                    }
                    if (
                        !taxInfoToDisplay.find(
                            (t) => t.taxId == assGroup.tax_id
                        )
                    ) {
                        taxInfoToDisplay.push({
                            taxId: assGroup.tax_id,
                            taxName: assGroup.tax.tax_name,
                            taxPercentage: assGroup.tax.tax_percentage,
                            amountCredit: totalCredit,
                            amountDebit: totalDebit,
                        });
                    } else {
                        taxInfoToDisplay.find(
                            (t) => t.taxId == assGroup.tax_id
                        ).amountCredit +=
                            (taxInfoI.amountCredit *
                                assGroup.tax.tax_percentage) /
                            100;
                        taxInfoToDisplay.find(
                            (t) => t.taxId == assGroup.tax_id
                        ).amountDebit +=
                            (taxInfoI.amountDebit *
                                assGroup.tax.tax_percentage) /
                            100;
                    }
                }
                if (vatTaxFound) {
                    if (!taxInfoToDisplay.find((t) => t.taxId == vatTax.id)) {
                        taxInfoToDisplay.push({
                            taxId: vatTax.id,
                            taxName: vatTax.tax_name,
                            taxPercentage: vatTax.tax_percentage,
                            amountCredit:
                                ((amountWithWithHoldingCredit +
                                    taxInfoI.amountCredit) *
                                    vatTax.tax_percentage) /
                                100,
                            amountDebit:
                                ((amountWithWithHoldingDedit +
                                    taxInfoI.amountDebit) *
                                    vatTax.tax_percentage) /
                                100,
                        });
                    } else {
                        taxInfoToDisplay.find(
                            (t) => t.taxId == vatTax.id
                        ).amountCredit +=
                            ((amountWithWithHoldingCredit +
                                taxInfoI.amountCredit) *
                                vatTax.tax_percentage) /
                            100;
                        taxInfoToDisplay.find(
                            (t) => t.taxId == vatTax.id
                        ).amountDebit +=
                            ((amountWithWithHoldingDedit +
                                taxInfoI.amountDebit) *
                                vatTax.tax_percentage) /
                            100;
                    }
                }
            }
        }
    }
    return { taxInfoToDisplay, currencyCode, subTotalCredit, subTotalDebit };
};

module.exports = { taxInfoDetailForDisplay, createRecurring };
