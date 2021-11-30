const { error, randomConcurrencyStamp } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const { role } = new PrismaClient();

const post = async (reqBody, privileges, next) => {
  const count = await role.count({
    where: {
      name: reqBody.name,
    },
  });
  if (count) {
    error("name", "role already exists", next);
    return false;
  }
  try {
    const data = await role.create({
      data: {
        name: reqBody.name,
        description: reqBody.description,
        privileges: {
          connect: privileges,
        },
        concurrency_stamp: randomConcurrencyStamp(),
      },
    });
    //   console.log(data);
    return { success: true };
  } catch (e) {
    if (
      e.meta.cause.match(
        /Expected [0-9]* records to be connected, found only [0-9]*/i
      )
    ) {
      error("privileges", "some of the privileges don't exist", next);
      return false;
    }
  }
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
  const data = await role.findMany({
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
  const myRole = await role.findUnique({
    select: { ...updateDataProjection, concurrency_stamp: true },
    where: { id: reqBody.id },
  });
  if (!myRole) {
    error("id", "role doesn't exist", next);
    return false;
  }
  if (myRole.concurrency_stamp !== reqBody.concurrency_stamp) {
    error("concurrency_stamp", "role already updated, refresh", next);
    return false;
  }
  if (updateData.name) {
    if (updateData.name === myRole.name) {
      updateData.name = undefined;
    } else {
      const data = await role.findUnique({
        select: { name: true },
        where: { name: updateData.name },
      });
      if (data) {
        error("name", "already exists", next);
        return false;
      }
    }
  }
  const privileges = updateData.privileges
    ? updateData.privileges.map((element) => {
        return { id: element };
      })
    : [];
  updateData.privileges = undefined;
  console.log({
    data: { ...updateData, privileges: { connect: privileges } },
    where: { id: reqBody.id },
  });
  console.log(privileges);
  try {
    await role.update({
      data: { ...updateData, privileges: { set: [], connect: privileges } },
      where: { id: reqBody.id },
    });
  } catch (e) {
    if (
      e.meta.cause.match(
        /Expected [0-9]* records to be connected, found only [0-9]*/i
      )
    ) {
      error("privileges", "some of the privileges don't exist", next);
      return false;
    }
  }
  return { success: true };
};
const deleter = async ({ id }) => {
  try {
    await role.delete({ where: { id } });
  } catch (e) {
    console.log(e);
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
