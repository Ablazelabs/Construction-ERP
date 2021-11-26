//this module performs authorization for users

const authorization = {
  userHasPrivilege: async (userId, previlage, next) => {
    return true;
    //calls error if user isn't authenticated
  },
  userHasPrivilegeOver: async (userId, secondUserId, previlage, next) => {
    return true;
  },
};

module.exports = authorization;
