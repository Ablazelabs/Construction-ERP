const { allModels } = require("../config/config");

const { accounting_period, general_journal_header } = allModels;

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
 * }>} generalJournalDetail
 * @param {Array<{
 *  seNum: number,
 *  id: number,
 *  taxName: string,
 *  taxCategory: string,
 *  taxPercentage: number,
 *  startDate:Date,
 *  endDate:Date,
 * }>} taxViewModel
 * @param {number} creator
 * @param {Function} next
 */
const createRecurring = async (
    generalJournalHeader,
    recurringJournal,
    generalJournalDetail,
    taxViewModel,
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
                            data: [
                                {
                                    comment:
                                        " Recurring journal created for " +
                                        generalJournalHeader.Currency
                                            .CurrencyCode +
                                        string.Format(
                                            "{0:n}",
                                            GeneralJournalDetail.Sum(
                                                (g) => g.AmountCredit
                                            )
                                        ),
                                },
                            ],
                            skipDuplicates: true,
                        },
                    },
                },
            },
        },
    });
};
createRecurring();
