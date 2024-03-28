const { LIMIT } = require("../PrivateConstants");
const BlogSchema = require("../Schema/BlogSchema");

const createBlog = ({ title, textBody, userId, creationDateTime }) => {
  return new Promise(async (resolve, reject) => {
    const blogObj = new BlogSchema({
      title,
      textBody,
      userId,
      creationDateTime,
    });

    try {
      const blogDb = await blogObj.save();
      resolve(blogDb);
    } catch (error) {
      reject(error);
    }
  });
};

const getAllBlogs = ({ SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // pagination, sort
      const blogsDb = await BlogSchema.aggregate([
        {
          $sort: { creationDateTime: -1 }, //DESC
        },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);

      console.log(blogsDb[0].data);
      resolve(blogsDb[0].data);
    } catch (error) {
      reject(error);
    }
  });
};

const getMyBlogs = ({ SKIP, userId }) => {
  return new Promise(async (resolve, reject) => {
    //pagination, sort, match
    try {
      const myBlogsDb = await BlogSchema.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $sort: { creationDateTime: -1 },
        },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);
      resolve(myBlogsDb[0].data);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createBlog, getAllBlogs, getMyBlogs };
