const { allModels } = require("../config/config");

const { currency, exchange_rate } = allModels;
/**
 *
 * @param {(import("@prisma/client").general_journal_detail & {
 *   general_journal_header: import("@prisma/client").general_journal_header;
 *   chart_of_account: import("@prisma/client").chart_of_account & {
 *       account_type:import("@prisma/client").account_type&{
 *          account_category:import("@prisma/client").account_category
 *       };
 *   };
 * })[]} journals
 * @param {import("@prisma/client").opening_balance & {
 *   opening_balance_account: (import("@prisma/client").opening_balance_account & {
 *       chart_of_account: import("@prisma/client").chart_of_account & {
 *          account_type:import("@prisma/client").account_type&{
 *              account_category:import("@prisma/client").account_category
 *       };
 *   };
 *   })[];
 * }} openingBalance
 */
const getAccounts = async (journals, openingBalance) => {
    // #region Local fields

    let reportSectionTotalAmount = 0;

    //Exchange rate fields

    let reportAccounts = [];
    const baseCurrency = await currency.findFirst({
        where: {
            is_base_currency: true,
        },
    });

    let groupedJournalsUnderAccountTypes = [...journals];
    for (let i in journals) {
        const accountTypeJournals = groupedJournalsUnderAccountTypes.filter(
            (elem) =>
                elem.chart_of_account.account_type_id ===
                journals[i].chart_of_account.account_type_id
        );
        if (accountTypeJournals.length) {
            let accountTypeTotalAmount = 0;
            groupedJournalsUnderAccountTypes =
                groupedJournalsUnderAccountTypes.filter(
                    (elem) =>
                        elem.chart_of_account.account_type_id !==
                        journals[i].chart_of_account.account_type_id
                );
            let reportItems = [];
            let journalsGroupedByAccount = [...accountTypeJournals];
            for (let i in accountTypeJournals) {
                const accountJournals = journalsGroupedByAccount.filter(
                    (elem) =>
                        elem.chart_of_account_id ===
                        accountTypeJournals[i].chart_of_account_id
                );
                if (accountJournals.length) {
                    journalsGroupedByAccount = journalsGroupedByAccount.filter(
                        (elem) =>
                            elem.chart_of_account_id ===
                            accountTypeJournals[i].chart_of_account_id
                    );
                    let amountDueToExchangeRate = 0;
                    const account = accountJournals[0].chart_of_account;
                    let journalsWithFCY = accountJournals.filter(
                        (elem) =>
                            elem.general_journal_header_id === baseCurrency.id
                    );
                    if (journalsWithFCY.length) {
                        amountDueToExchangeRate =
                            await convertJournalTransactionToBaseCurrency(
                                journalsWithFCY,
                                baseCurrency
                            );
                    }
                    const currencyJournals = accountJournals.filter(
                        (elem) =>
                            elem.general_journal_header.currency_id ==
                            baseCurrency.id
                    );
                    const accountBalance =
                        getOpeningBalanceAmount(openingBalance, account.id) +
                        (getTotalDebitAmount(currencyJournals, account) +
                            getTotalCreditAmount(currencyJournals, account)) +
                        amountDueToExchangeRate;
                    if (accountBalance != 0) {
                        accountTypeTotalAmount += accountBalance;

                        reportItems.push({
                            accountId: account.id,
                            accountType: account.account_type.type,
                            accountName:
                                account.account_name +
                                "(" +
                                account.account_code +
                                ")",
                            amount: `${accountBalance}`,
                        });
                    }
                }
            }
            reportSectionTotalAmount += accountTypeTotalAmount;
            reportAccounts.push(...reportItems);
        }
    }
    return { reportAccounts, reportSectionTotalAmount };

    // #endregion

    //Loop through all Account Type of a specific Report Section
};
/**
 *
 * @param {Array<import("@prisma/client").general_ledger & {general_journal_header:import("@prisma/client").general_journal_header}>} generalLedgerWithFCY
 * @param {Function} getTotalCreditAmount
 * @param {Function} getTotalDebitAmount
 * @returns
 */
const convertGeneralLedgerToBaseCurrency = async (
    generalLedgerWithFCY,
    getTotalCreditAmount,
    getTotalDebitAmount
) => {
    const minMaxDates = generalLedgerWithFCY.map(({ general_journal_header }) =>
        general_journal_header.journal_date.getTime()
    );
    const startDate = new Date(Math.min(...minMaxDates));
    const endDate = new Date(Math.max(...minMaxDates));

    const exchangeRates = await exchange_rate.findMany({
        where: {
            status: 0,
            date: {
                gt: new Date(startDate.getFullYear(), startDate.getMonth(), 0),
                lt: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0),
            },
        },
    });
    let amountInFCY = 0;
    let amountInBCY = 0;
    let totalAmountInBCY = 0;

    for (let i in generalLedgerWithFCY) {
        const journal = generalLedgerWithFCY[i];
        amountInFCY = 0;
        amountInBCY = 0;

        const exchangeRate = exchangeRates.find(
            (elem) =>
                elem.date.getFullYear() ==
                    journal.general_journal_header.journal_date.getFullYear() &&
                elem.date.getMonth() ==
                    journal.general_journal_header.journal_date.getMonth() &&
                elem.currency_id == journal.general_journal_header.currency_id
        );

        if (exchangeRate) {
            amountInFCY =
                getTotalDebitAmount([journal], journal.chart_of_account) +
                getTotalCreditAmount([journal], journal.chart_of_account);
            amountInBCY = amountInFCY * exchangeRate.rate;
        }
        totalAmountInBCY += amountInBCY;
    }

    return totalAmountInBCY;
};
/**
 *
 * @param {Array<import("@prisma/client").general_ledger & {general_journal_header:import("@prisma/client").general_journal_header}>} journalsWithFCY
 * @param {Function} getTotalCreditAmount
 * @param {Function} getTotalDebitAmount
 * @returns
 */
const convertJournalTransactionToBaseCurrency = async (
    journalsWithFCY,
    getTotalCreditAmount,
    getTotalDebitAmount
) => {
    return await convertGeneralLedgerToBaseCurrency(
        journalsWithFCY,
        getTotalCreditAmount,
        getTotalDebitAmount
    );
};
/**
 *
 * @param {import("@prisma/client").opening_balance & {
 *  opening_balance_account:Array<import("@prisma/client").opening_balance_account & {
 *      chart_of_account:import("@prisma/client").chart_of_account &{
 *          account_type:import("@prisma/client").account_type &{
 *              account_category: import("@prisma/client").account_category
 *          }
 *      }
 *  }>
 * } | import("@prisma/client").opening_balance_account & {
 *      chart_of_account:import("@prisma/client").chart_of_account &{
 *          account_type:import("@prisma/client").account_type &{
 *              account_category: import("@prisma/client").account_category
 *          }
 *      }
 *  }} openingBalance
 * @param {number} chartOfAccountId
 * @returns {number}
 */
const getOpeningBalanceAmount = (openingBalance, chartOfAccountId) => {
    if (openingBalance?.opening_balance_account) {
        if (openingBalance?.opening_balance_account.length) {
            const openingBalanceAccount =
                openingBalance.opening_balance_account.find(
                    (ob) => ob.chart_of_account_id == chartOfAccountId
                );

            if (openingBalanceAccount) {
                if (
                    openingBalanceAccount.chart_of_account.account_type
                        .account_category.is_debit
                )
                    return openingBalanceAccount.debit_or_credit == 2
                        ? openingBalanceAccount.amount_debit
                        : -openingBalanceAccount.amount_credit;
                else
                    return openingBalanceAccount.debit_or_credit == 1
                        ? openingBalanceAccount.amount_credit
                        : -openingBalanceAccount.amount_debit;
            }
        }
        return 0;
    } else {
        const openingBalanceAccount = openingBalance;
        if (openingBalanceAccount) {
            if (
                openingBalanceAccount.chart_of_account.account_type
                    .account_category.is_debit
            )
                return openingBalanceAccount.debit_or_credit == 2
                    ? openingBalanceAccount.amount_debit
                    : -openingBalanceAccount.amount_credit;
            else
                return openingBalanceAccount.debit_or_credit == 1
                    ? openingBalanceAccount.amount_credit
                    : -openingBalanceAccount.amount_debit;
        }
    }
    return 0;
};
const getTotalDebitAmount = (generalLedger, chartOfAccount) => {
    if (generalLedger.length) {
        let sum = 0;
        generalLedger.forEach((elem) => {
            if (elem.chart_of_account_id === chartOfAccount.id)
                sum += elem.amount_debit;
        });
        return chartOfAccount.account_type.account_category.is_debit
            ? sum
            : -sum;
    }
};
const getTotalCreditAmount = (generalLedger, chartOfAccount) => {
    if (generalLedger.length) {
        let sum = 0;
        generalLedger.forEach((elem) => {
            if (elem.chart_of_account_id === chartOfAccount.id)
                sum += elem.amount_credit;
        });
        return chartOfAccount.account_type.account_category.is_debit
            ? -sum
            : sum;
    }
};
/**
 *
 * @param { import("@prisma/client").chart_of_account&{
 *     account_type:import("@prisma/client").account_type  &{
 *     account_category: import("@prisma/client").account_category
 *     }
 * } } account
 * @param {number} amount
 * @returns
 */
const identifyAndReturnCreditOrDebitAmount = (account, amount) => {
    let debitAmount = 0,
        creditAmount = 0;

    if (account.account_type.account_category.is_debit) {
        if (amount < 0) {
            creditAmount = amount;
            debitAmount = 0;
        } else {
            debitAmount = amount;
            creditAmount = 0;
        }
    } else {
        if (amount < 0) {
            creditAmount = 0;
            debitAmount = amount;
        } else {
            debitAmount = 0;
            creditAmount = amount;
        }
    }
    //item1 is debit
    //item1 is credit
    return { creditAmount, debitAmount };
};
module.exports = {
    getAccounts,
    convertGeneralLedgerToBaseCurrency,
    convertJournalTransactionToBaseCurrency,
    getOpeningBalanceAmount,
    getTotalCreditAmount,
    getTotalDebitAmount,
    identifyAndReturnCreditOrDebitAmount,
};
