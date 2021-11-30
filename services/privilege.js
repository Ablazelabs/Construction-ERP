const { error, randomConcurrencyStamp } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const { privilege } = new PrismaClient();

const post = async (reqBody, next) => {
  const count = await privilege.count({
    where: {
      action: reqBody.action,
    },
  });
  if (count) {
    error("action", "privilege already exists", next);
    return false;
  }
  await privilege.create({
    data: {
      action: reqBody.action,
      description: reqBody.description,
      concurrency_stamp: randomConcurrencyStamp(),
    },
  });
  return { success: true };
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
  const data = await privilege.findMany({
    where: {
      ...queryFilter,
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
  const myPrivilege = await privilege.findUnique({
    select: { ...updateDataProjection, concurrency_stamp: true },
    where: { id: reqBody.id },
  });
  if (!myPrivilege) {
    error("id", "privilege doesn't exist", next);
    return false;
  }
  if (myPrivilege.concurrency_stamp !== reqBody.concurrency_stamp) {
    error("concurrency_stamp", "privilege already updated, refresh", next);
    return false;
  }
  if (updateData.action) {
    if (updateData.action === myPrivilege.action) {
      updateData.action = undefined;
    } else {
      const data = await privilege.findUnique({
        select: { action: true },
        where: { action: updateData.action },
      });
      if (data) {
        error("name", "already exists", next);
        return false;
      }
    }
  }
  console.log({
    data: { ...updateData },
    where: { id: reqBody.id },
  });
  await privilege.update({
    data: { ...updateData },
    where: { id: reqBody.id },
  });
  return { success: true };
};

const deleter = async ({ id }) => {
  try {
    await privilege.delete({ where: { id } });
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
