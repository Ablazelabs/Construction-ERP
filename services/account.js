const {
  error,
  confirmCredential,
  randomConcurrencyStamp,
} = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const { genSalt, hash } = require("bcrypt");
const validation = require("../validation/validation");
const { user } = new PrismaClient();

const post = async (identifier, identifierKey, reqBody, next) => {
  const queryResult = await user.findUnique({
    where: { ...identifier },
  });

  if (queryResult) {
    error(identifierKey, "account already registered", next);
    return false;
  }
  const salt = await genSalt(10);
  const hashPassword = await hash(reqBody.password, salt);

  //create a random number to send to user so that they can confirm it, put in a static code for easier testing
  //TODO remove the 123456 number
  const randomValue = 123456 || Math.random() * 100000;
  await confirmCredential(identifier[identifierKey], randomValue);

  await user.create({
    data: {
      ...identifier,
      password: hashPassword,
      code: randomValue,
      concurrency_stamp: randomConcurrencyStamp(),
    },
  });
  return { success: true };
};
const get = async (queryFilter, querySort, role, limit, skip, projection) => {
  console.log({
    ...queryFilter,
    ...role,
  });
  const data = await user.findMany({
    where: {
      ...queryFilter,
      ...role,
    },
    orderBy: {
      ...querySort,
    },
    take: limit,
    skip,
    select: {
      ...projection,
    },
  });
  return data;
};
const patch = async (updateDataProjection, reqBody, updateData, next) => {
  const myUser = await user.findUnique({
    select: { ...updateDataProjection, concurrency_stamp: true },
    where: { id: reqBody.id },
  });

  if (!myUser) {
    error("id", "account doesn't exist", next);
    return false;
  }
  if (myUser.concurrency_stamp !== reqBody.concurrency_stamp) {
    error("concurrency_stamp", "account already updated, refresh", next);
    return false;
  }
  if (updateData.email) {
    if (updateData.email === myUser.email) {
      updateData.email = undefined;
    } else {
      if (!validation.checkEmail(updateData.email, next)) {
        return false;
      }
      const data = await user.findUnique({
        select: { email: true },
        where: { email: updateData.email },
      });
      if (data) {
        error("email", "already exists", next);
        return false;
      }
    }
  }
  if (updateData.phone_number) {
    if (updateData.phone_number === myUser.phone_number) {
      updateData.phone_number = undefined;
    } else {
      if (!validation.checkPhoneNumber(updateData.phone_number, next)) {
        return false;
      }
      const data = await user.findUnique({
        select: { phone_number: true },
        where: { phone_number: updateData.phone_number },
      });
      if (data) {
        error("phone_number", "already exists", next);
        return false;
      }
    }
  }
  updateData.roleId = updateData.role;
  updateData.role = undefined;
  try {
    await user.update({
      data: { ...updateData },
      where: { id: reqBody.id },
    });
  } catch (e) {
    // console.log(e);
    if (e.meta.field_name == "roleId") {
      error("role", "doesn't exist", next);
      return false;
    }
  }
  return { success: true };
};

const deleter = async (reqBody) => {
  try {
    await user.delete({ where: { id: reqBody.id } });
  } catch {
    return { success: false };
  }
  return { success: true };
};

module.exports = {
  post,
  get,
  patch,
  deleter,
};
