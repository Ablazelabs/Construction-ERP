const confirmCredential = async (to, code) => {
  //TODO
  /**
   * send email or sms to given to(could be phone or email)
   * nothing else to worry about
   */
};
const randomConcurrencyStamp = () => {
  return "random";
};
const error = (key, message, next, status = 400) => {
  const myError = { status };
  myError[key] = message;
  next(new Error(JSON.stringify(myError)));
};
module.exports = { error, confirmCredential, randomConcurrencyStamp };
