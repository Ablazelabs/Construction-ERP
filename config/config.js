const confirmCredential = async (to, code) => {
    //TODO
    /**
     * send email or sms to given to(could be phone or email)
     * nothing else to worry about
     */
};
/**
 *
 * @param {string} to email receiver
 * @param {string} title
 * @param {string} subject
 * @param {string} body
 * @param {Array<{fileName:string, file:Buffer}>} attachments
 */
const sendEmail = async (to, title, subject, body, attachments) => {};
const randomConcurrencyStamp = () => {
    return "random";
};
/**
 *
 * @param {string} key argument of the error
 * @param {string} message error message to send client
 * @param {Function} next the next middleware function of express
 * @param {number} status status of the error(default 400)
 */
const error = (key, message, next, status = 400) => {
    const myError = { status };
    myError[key] = message;
    next(new Error(JSON.stringify(myError)));
};
const { PrismaClient } = require("@prisma/client");

const allModels = new PrismaClient();
module.exports = {
    error,
    sendEmail,
    confirmCredential,
    randomConcurrencyStamp,
    allModels,
};
