const { confirmCredential } = require("../config/config");
const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();

module.exports = async (identifier, identifierValue, code) => {
  await user.update({
    where: {
      ...identifier,
    },
    data: {
      code,
    },
  });
  await confirmCredential(identifierValue, code, "2");
  return { success: true };
};
