const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { Categories } = require("../models");

const createCategory = async (data) => {
  const categories = await Categories.create(data);
  return categories;
};

const queryCategories = async (filter, options) => {

  const query = {};

  // Loop through each filter field and add conditions if they exist
  for (const key of Object.keys(filter)) {
    if (key === "name" && filter[key] !== "") {
      query[key] = { $regex: filter[key], $options: "i" }; // Case-insensitive regex search for name
    } else if (filter[key] !== "") {
      query[key] = filter[key];
    }
  }

  const categories = await Categories.paginate(query, options);
  return categories;
};

const getCategoryById = async (categoryId) => {
  const category = await Categories.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};


const updateCategoryById = async (categoryId, data) => {
  const category = await getCategoryById(categoryId);
  Object.assign(category, data);
  await category.save();
  return category;
};

const deleteCategoryById = async (categoryId) => {
  const category = await Categories.findByIdAndDelete(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};


module.exports = {
    createCategory,
    queryCategories,
    getCategoryById,
    updateCategoryById,
    deleteCategoryById
};
