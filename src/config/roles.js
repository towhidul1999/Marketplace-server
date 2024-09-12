const allRoles = {
  freelancer: ['freelancer','common','withOutAdmin'],
  buyer: ['buyer','common','withOutAdmin'],
  admin: ['admin','common'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

