const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { Blog } = require("../models");

const createBlog = async (data) => {
console.log(data)
  const title = await Blog.findOne({ slug: data.slug });
  if (title) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This title already exists, try another one"
    );
  }
  const blog = await Blog.create(data);
  return blog;
};

const queryBlogs = async (filter, options) => {
  const blogs = await Blog.paginate(filter, options);
  return blogs;
};

const getBlogById = async (id) => {
  const blog = await Blog.findById(id);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return blog;
};

const deleteBlogById = async (id) => {
  const blog = await Blog.findByIdAndDelete(id);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return blog;
};

const updateBlogById = async (id, bodyData, image) => {
  const blog = await getBlogById(id);
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }
  if (image) {
    blog.image = image;
  }

  Object.assign(blog, bodyData);
  await blog.save();
  return blog;
};

const getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug });
  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }
  return blog;
}

module.exports = {
  createBlog,
  queryBlogs,
  getBlogById,
  deleteBlogById,
  updateBlogById,
  getBlogBySlug
};
