const { error, allModels } = require("../config/config");
const { payment_request, project_request, petty_cash } = allModels;
const { unlinkSync } = require("fs");
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
        delete reqBody.project_request_id;
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
        //add project id to the model too... if there is project request there is project
        const projectRequest = await project_request.findUnique({
            where: {
                id: reqBody.project_request_id,
            },
        });
        if (!projectRequest) {
            error("project_request_id", "project request doesn't exist", next);
            return false;
        }
        reqBody.project_id = projectRequest.project_id;
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
    // reqBody.prepared_by_id = creator;
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
            "please prepare pv for pettycash replensishment, pettycash balcnce is currently zero"
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
    if (updateData.amount && updatedPV.amount != updateData.amount) {
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
    if (
        updateData.project_request_id &&
        updateData.project_request_id != updatedPV.project_request_id
    ) {
        //update project if project request changes!
        const projectRequest = await project_request.findUnique({
            where: {
                id: updateData.project_request_id,
            },
        });
        if (!projectRequest) {
            error("project_request_id", "project request doesn't exist", next);
            return false;
        }
        updateData.project_id = projectRequest.project_id;
    }
    delete reqBody.additional_docs;
    delete reqBody.number_of_documents;
    delete reqBody.prepare_payment_to_id_file;
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
const patchPettyCash = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    const updatedPetty = await petty_cash.findUnique({
        where: {
            id: reqBody.id,
        },
    });
    let newDecreased = 0;
    if (
        updateData.amount_paid &&
        updatedPetty.amount_paid != updateData.amount_paid
    ) {
        newDecreased = updateData.amount - updatedPetty.amount_paid;
    }
    if (
        updateData.project_request_id &&
        updateData.project_request_id != updatedPV.project_request_id
    ) {
        //update project if project request changes!
        const projectRequest = await project_request.findUnique({
            where: {
                id: updateData.project_request_id,
            },
        });
        if (!projectRequest) {
            error("project_request_id", "project request doesn't exist", next);
            return false;
        }
        updateData.project_id = projectRequest.project_id;
    }
    delete reqBody.additional_docs;
    delete reqBody.number_of_documents;
    delete reqBody.prepare_payment_to_id_file;
    return Promise.all([
        mPatch(
            updateDataProjection,
            reqBody,
            updateData,
            operationDataType,
            creator,
            uniqueValues,
            next
        ),
        await payment_request.update({
            where: {
                id: updatedPetty.payment_request_id,
            },
            data: {
                remaining_balance: {
                    decrement: newDecreased,
                },
            },
        }),
    ]);
};
/**
 *
 * @param {number} id
 * @param {Array<string>} urls
 * @param {import('express').NextFunction} next
 */
const addAttachments = async (id, urls, next) => {
    const paymentRequest = await payment_request.findUnique({
        where: { id },
    });
    if (paymentRequest) {
        const addedAttachments = paymentRequest.additional_docs;
        const addedAttachmentsArray = JSON.parse(addedAttachments);
        const newSet = addedAttachmentsArray.concat(urls);
        const data = await payment_request.update({
            where: { id },
            data: {
                additional_docs: JSON.stringify(newSet),
                number_of_documents: newSet.length,
            },
        });
        return { success: true, data };
    } else {
        error("id", "payment request with this id not found!", next);
        return false;
    }
};

const removeAttachment = async (id, removedIndex, next) => {
    const paymentRequest = await payment_request.findUnique({
        where: { id },
    });
    //remove the file if u can!
    if (paymentRequest) {
        const attachments = paymentRequest.additional_docs;
        const attachmentsArray = JSON.parse(attachments);
        let [removed] = attachmentsArray.splice(removedIndex, 1);
        await payment_request.update({
            where: { id },
            data: {
                additional_docs: JSON.stringify(attachmentsArray),
                number_of_documents: attachmentsArray.length,
            },
        });
        try {
            removed = removed.replace(/\//, "");
            unlinkSync(removed);
        } catch (e) {
            console.log(e);
        }
        return { success: true };
    } else {
        error("id", "payment request with this id not found!", next);
        return false;
    }
};

/**
 *
 * @param {number} id
 * @param {string} url
 * @param {import('express').NextFunction} next
 */
const addIdImagePayment = async (id, url, next) => {
    const paymentRequest = await payment_request.findUnique({
        where: { id },
    });
    let removed = paymentRequest.prepare_payment_to_id_file;
    if (paymentRequest) {
        await payment_request.update({
            where: { id },
            data: { prepare_payment_to_id_file: url },
        });
        try {
            removed = removed.replace(/\//, "");
            unlinkSync(removed);
        } catch (e) {
            console.log(e);
        }
        return { success: true };
    } else {
        error("id", "payment request with this id not found!", next);
        return false;
    }
};
/**
 *
 * @param {number} id
 * @param {string} url
 * @param {import('express').NextFunction} next
 */
const addIdImagePetty = async (id, url, next) => {
    const pettyCash = await petty_cash.findUnique({
        where: { id },
    });
    let removed = pettyCash.paid_to_id_file;
    if (pettyCash) {
        await petty_cash.update({
            where: { id },
            data: { paid_to_id_file: url },
        });
        try {
            removed = removed.replace(/\//, "");
            unlinkSync(removed);
        } catch (e) {
            console.log(e);
        }
        return { success: true };
    } else {
        error("id", "payment request with this id not found!", next);
        return false;
    }
};

const deleter = async ({ id }, operationDataType) => {
    return mDelete(id, operationDataType);
};

module.exports = {
    postPaymentRequest,
    patchPaymentRequest,
    postPettyCash,
    patchPettyCash,
    addAttachments,
    addIdImagePayment,
    addIdImagePetty,
    removeAttachment,
    deleter,
};
// same as the others
