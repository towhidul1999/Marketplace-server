const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Privacy, Terms, TrustSafety } = require("../models");
const he = require("he");

const createPrivacy = async (privacyBody) => {
  if (privacyBody.content) {
    privacyBody.content = he.decode(privacyBody.content);
  }

  const existingPrivacy = await Privacy.findOne();
  if (existingPrivacy) {
    existingPrivacy.set(privacyBody);
    await existingPrivacy.save();
    return existingPrivacy;
  } else {
    const newPrivacy = await Privacy.create(privacyBody);
    return newPrivacy;
  }
};

const queryPrivacy = async () => {
  const privacy = await Privacy.find();
  return privacy;
};

const createTerms = async (termsBody) => {
  if (termsBody.content) {
    termsBody.content = he.decode(termsBody.content);
  }

  const existingTerms = await Terms.findOne();
  if (existingTerms) {
    existingTerms.set(termsBody);
    await existingTerms.save();
    return existingTerms;
  } else {
    const newTerms = await Terms.create(termsBody);
    return newTerms;
  }
};

const queryTerms = async () => {
  const terms = await Terms.find();
  return terms;
};

const createTrustSafety = async (body) => {
  if (body.content) {
    body.content = he.decode(body.content);
  }

  const existingTrustSafety = await TrustSafety.findOne();
  if (existingTrustSafety) {
    existingTrustSafety.set(body);
    await existingTrustSafety.save();
    return existingTrustSafety;
  } else {
    const newTrustSafety = await TrustSafety.create(body);
    return newTrustSafety;
  }
};

const queryTrustSafety = async () => {
  const trustSafety = await TrustSafety.find();
  return trustSafety;
};

module.exports = {
  createPrivacy,
  queryPrivacy,
  createTerms,
  queryTerms,
  createTrustSafety,
  queryTrustSafety,
};
