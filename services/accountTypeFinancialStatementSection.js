const { allModels } = require("../config/config");

const {
    financial_statement_section,
    account_type_financial_statement_section,
} = allModels;
// const get = async () => {
//     let accountTypeFinancialStatementSectionViewModel = {
//         financial_statement_type: 2,
//     };
//     const financialStatementSections =
//         await financial_statement_section.findMany({
//             where: {
//                 status: 0,
//             },
//             orderBy: [
//                 { sequence_on_report: "asc" },
//                 { financial_statement_type: "asc" },
//             ],
//         });
//     if (financialStatementSections.length) {
//         accountTypeFinancialStatementSectionViewModel.financialStatementSections =
//             financialStatementSections;
//         accountTypeFinancialStatementSectionViewModel.financialStatementSectionId =
//             financialStatementSections[0]?.id;
//     }
//     const filteredFinancialStatementSections =
//         financialStatementSections.filter(
//             (acc) => acc.financial_statement_type === 2
//         );
//     return {
//         view: accountTypeFinancialStatementSectionViewModel,
//         filteredSelectList: filteredFinancialStatementSections,
//     };
// };
const get = async () => {
    let treeData = [
        { id: 100000, name: "Balance Sheet", value: 100000, children: [] },
        { id: 100001, name: "Income Statement", value: 100000, children: [] },
        {
            id: 100002,
            name: "Cash Flow Statement",
            value: 100000,
            children: [],
        },
    ];
    const financialStatementSections =
        await financial_statement_section.findMany({
            where: { status: 0 },
            orderBy: [
                { sequence_on_report: "asc" },
                { financial_statement_type: "asc" },
            ],
        });
    const assignedAccountTypeToFinancialStatementSections =
        await account_type_financial_statement_section.findMany({
            include: { financial_statement_section: true, account_type: true },
        });

    for (let i in financialStatementSections) {
        const reportSection = financialStatementSections[i];
        let parentIndex = 0;
        if (reportSection.financial_statement_type === 2) parentIndex = 0;
        else if (reportSection.financial_statement_type === 1) parentIndex = 1;
        else parentIndex = 2;
        let grandChildren = [];
        for (let k in assignedAccountTypeToFinancialStatementSections) {
            const assignedAccountType =
                assignedAccountTypeToFinancialStatementSections[k];
            if (
                reportSection.id ===
                assignedAccountType.financial_statement_section_id
            ) {
                grandChildren.push({
                    id: `grandChild-${i}-${assignedAccountType.id}`,
                    name: assignedAccountType.account_type.type,
                    value: 100000,
                });
            }
        }
        treeData[parentIndex].children.push({
            id: `child-${i}- ${reportSection.id}`,
            name: reportSection.name,
            value: 100000,
            children: grandChildren,
        });
    }
    return treeData;
};
/**
 *
 * @param {{
 *   financialStatementType: number
 *   financialStatementSectionId : number
 *   financialStatementSections: Array<import("@prisma/client").financial_statement_section>
 *   accountTypeIds:Array<number>
 * }} viewModel
 * @param {number} creator
 */
const post = async (viewModel, creator) => {
    const { accountTypeIds } = viewModel;
    const accountTypeFinancialStatementSection = {
        financial_statement_section_id: viewModel.financialStatementSectionId,
    };
    let accountTypeFinancialStatementSections = [];
    if (accountTypeIds) {
        for (let i in accountTypeIds) {
            const accType = accountTypeIds[i];
            accountTypeFinancialStatementSections.push({
                financial_statement_section_id:
                    viewModel.financialStatementSectionId,
                account_type_id: accType,
            });
        }
        //jumped here for saveBulk
        return await saveBulk(
            accountTypeFinancialStatementSection,
            accountTypeFinancialStatementSections,
            creator
        );
    } else {
        return await saveBulk(
            accountTypeFinancialStatementSection,
            accountTypeFinancialStatementSections,
            creator
        );
    }
};

/**
 *
 * @param {{financial_statement_section_id:number}} accountStatementSection
 * @param {Array<{financial_statement_section_id:number, account_type_id:number}>} accountStatementSections
 * @param {number} creator
 */
const saveBulk = async (
    accountStatementSection,
    accountStatementSections,
    creator
) => {
    return { success: true };
};
module.exports = { get, post };
