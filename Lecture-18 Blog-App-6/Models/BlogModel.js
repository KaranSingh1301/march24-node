const { LIMIT } = require("../PrivateConstants");
const BlogSchema = require("../Schema/BlogSchema");
const { ObjectId } = require("mongodb");

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

const getAllBlogs = ({ followingUserIds, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // pagination, sort
      const blogsDb = await BlogSchema.aggregate([
        {
          $match: { userId: { $in: followingUserIds } },
        },
        {
          $sort: { creationDateTime: -1 }, //DESC
        },
        {
          $facet: {
            data: [{ $skip: SKIP }, { $limit: LIMIT }],
          },
        },
      ]);

      // console.log(blogsDb[0].data);
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

const getBlogWithId = ({ blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ObjectId.isValid(blogId)) reject("Invalid blogId format");

      const blogDb = await BlogSchema.findOne({ _id: blogId });

      if (!blogDb) reject(`No Blog found with blogId : ${blogId}`);

      resolve(blogDb);
    } catch (error) {
      reject(error);
    }
  });
};

const updateBlog = ({ title, textBody, blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blogPrevDb = await BlogSchema.findOneAndUpdate(
        { _id: blogId },
        { title, textBody }
      );
      resolve(blogPrevDb);
    } catch (error) {
      reject(error);
    }
  });
};

const deleteBlog = ({ blogId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const prevBlogDb = await BlogSchema.findOneAndDelete({ _id: blogId });
      resolve(prevBlogDb);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogWithId,
  updateBlog,
  deleteBlog,
};
