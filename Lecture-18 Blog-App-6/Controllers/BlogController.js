const express = require("express");
const User = require("../Models/UserModel");
const BlogSchema = require("../Schema/BlogSchema");

const { BlogDataValidate } = require("../Utils/BlogUtil");
const {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogWithId,
  updateBlog,
  deleteBlog,
} = require("../Models/BlogModel");
const { followingUserList } = require("../Models/FollowModel");

const BlogRouter = express.Router();

BlogRouter.post("/create-blog", async (req, res) => {
  const { title, textBody } = req.body;
  const userId = req.session.user.userId;
  const creationDateTime = Date.now();

  try {
    await BlogDataValidate({ title, textBody });

    await User.findUserWithKeys({ key: userId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Data error",
      error: error,
    });
  }
  try {
    const blogDb = await createBlog({
      title,
      textBody,
      userId,
      creationDateTime,
    });

    return res.send({
      status: 201,
      message: "Blog created successfully",
      data: blogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

// /get-blogs?skip=5
BlogRouter.get("/get-blogs", async (req, res) => {
  const SKIP = Number(req.query.skip) || 0;
  const followerUserId = req.session.user.userId;
  //get all the blogs
  try {
    const followingList = await followingUserList({ followerUserId, SKIP });

    const followingUserIds = followingList.map((item) => item._id);

    const blogsDb = await getAllBlogs({ followingUserIds, SKIP });
    if (blogsDb.length === 0) {
      return res.send({
        status: 202,
        message: "No more todos",
      });
    }

    return res.send({
      status: 200,
      message: "Read success",
      data: blogsDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

BlogRouter.get("/my-blogs", async (req, res) => {
  const SKIP = parseInt(req.query.skip) || 0;
  const userId = req.session.user.userId;

  try {
    const myBlogsDb = await getMyBlogs({ SKIP, userId });

    if (myBlogsDb.length === 0) {
      return res.send({
        status: 202,
        message: "No more todos",
      });
    }

    return res.send({
      status: 200,
      message: "Read success",
      data: myBlogsDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

// blogId
// data : {
// title, textBody
//}
BlogRouter.post("/edit-blog", async (req, res) => {
  const blogId = req.body.blogId;
  const { title, textBody } = req.body.data;
  const userId = req.session.user.userId;

  //data validation
  try {
    await BlogDataValidate({ title, textBody });

    //verify the userId
    // await User.findUserWithKeys({ key: userId });
  } catch (error) {
    return res.send({
      status: 400,
      message: "Data error",
      error: error,
    });
  }

  //find the blog

  try {
    const blogDb = await getBlogWithId({ blogId });

    // Check the ownership
    if (!userId.equals(blogDb.userId)) {
      return res.send({
        status: 403,
        message: "Not Authorized to edit this blog",
      });
    }

    //check if > 30 mins

    const diff = (Date.now() - blogDb.creationDateTime) / (1000 * 60);
    console.log(diff);
    if (diff > 30) {
      return res.send({
        status: 400,
        message: "Not allow to edit the blog after 30 mins of creation",
      });
    }

    //update the blog
    const prevBlogDb = await updateBlog({ title, textBody, blogId });

    return res.send({
      status: 200,
      message: "Blog Updated Successfully",
      data: prevBlogDb,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

BlogRouter.post("/delete-blog", async (req, res) => {
  const blogId = req.body.blogId;
  const userId = req.session.user.userId;

  try {
    const blogDb = await getBlogWithId({ blogId });
    console.log(userId, blogDb.userId);
    if (!userId.equals(blogDb.userId)) {
      return res.send({
        status: 403,
        message: "Not authorized to delete the blog",
      });
    }

    const prevBlogDb = await deleteBlog({ blogId });

    return res.send({
      status: 200,
      message: "Blog deleted successfully",
      data: prevBlogDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

module.exports = BlogRouter;
