const { error, allModels } = require("../config/config");
const { payment_request } = allModels;
const {
    post: mPost,
    patch: mPatch,
    deleter: mDelete,
} = require("./mostCRUD/mostCRUD");
const FORENUM = { "Petty Cash Replenishment": 1, project_request: 2, other: 3 };
const getLastPettyCash = () => {
    return payment_request.findFirst({
        where: {
            for: FORENUM["Petty Cash Replenishment"],
        },
        orderBy: {
            creationDate: "desc",
        },
    });
};
const postPaymentRequest = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    //delete the file strings so that nothing gets past us
    delete reqBody.prepare_payment_to_id_file;
    //add up the fields not required in input but required in db
    // {
    //     "additional_docs": "string",
    //     "number_of_documents": "number",
    //     "balance": "number",
    //     "remaining_balance": "number"
    // }

    reqBody.additional_docs = "[]";
    reqBody.number_of_documents = 0;
    reqBody.balance = reqBody.amount;

    if (reqBody.for === FORENUM["Petty Cash Replenishment"]) {
        //get the remaining balnce of the previous pettycash and add it to the amount of this one
        const lastPettyCash = await getLastPettyCash();
        if (lastPettyCash) {
            reqBody.balance += lastPettyCash.remaining_balance;
        }
    } else if (reqBody.for === FORENUM.project_request) {
        //make sure the project request has been selected
        if (!reqBody.project_request_id) {
            error(
                "project_request_id",
                "please select what project requst you want to prepare pv to",
                next
            );
            return false;
        }
        //if sent then hip hip hurray
    }
    if (reqBody.prepare_payment_to_id) {
        delete reqBody.prepare_payment_to_name;
    } else if (reqBody.prepare_payment_to_name) {
        //good, good good!
    } else {
        error(
            "prepared_payment",
            "please send prepared payment to user, name or id of the employee",
            next
        );
        return false;
    }
    reqBody.prepared_by_id = creator;
    reqBody.remaining_balance = reqBody.balance;
    return mPost(reqBody, operationDataType, creator, uniqueValues, next);
};
const postPettyCash = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    //delete the file strings so that nothing gets past us
    delete reqBody.paid_to_id_file;
    const lastPettyCash = await getLastPettyCash();
    if (lastPettyCash) {
        reqBody.payment_request_id = lastPettyCash.id;
        if (reqBody.amount_paid > lastPettyCash.remaining_balance) {
            error(
                "amount_paid",
                `amount paid can't be more than remaining balance (${lastPettyCash.remaining_balance}) in petty cash, please replenish petty cash balance`,
                next
            );
            return false;
        }
    } else {
        error(
            "petty_cash",
            "please prepare pv for pettycash replensishment, pettycash amount is currently zero"
        );
        return false;
    }
    return Promise.all([
        mPost(reqBody, operationDataType, creator, uniqueValues, next),
        payment_request.update({
            where: {
                id: lastPettyCash.id,
                remaining_balance:
                    lastPettyCash.remaining_balance - reqBody.amount_paid,
            },
        }),
    ]);
};
const patchPaymentRequest = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    const updatedPV = await payment_request.findUnique({
        where: { id: reqBody.id },
    });
    if (updateData.amount) {
        if (updatedPV.checked_by_id || updatedPV.approved_by_id) {
            error(
                "amount",
                "sorry, you can't change the amount, after the document has been checked or approved!",
                next
            );
            return false;
        } else {
            updateData.balance += updateData.amount - updatedPV.amount;
            updateData.remaining_balance +=
                updateData.amount - updatedPV.amount;
        }
    }
    delete reqBody.additional_docs;
    delete reqBody.number_of_documents;
    return mPatch(
        updateDataProjection,
        reqBody,
        updateData,
        operationDataType,
        creator,
        uniqueValues,
        next
    );
};
const deleter = async ({ id }, operationDataType) => {
    return mDelete(id, operationDataType);
};

module.exports = {
    postPaymentRequest,
    patchPaymentRequest,
    postPettyCash,
    deleter,
};
// same as the others
