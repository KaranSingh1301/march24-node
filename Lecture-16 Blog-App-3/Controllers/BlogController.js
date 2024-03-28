const express = require("express");
const { BlogDataValidate } = require("../Utils/BlogUtil");
const User = require("../Models/UserModel");
const { createBlog, getAllBlogs, getMyBlogs } = require("../Models/BlogModel");

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

  //get all the blogs
  try {
    const blogsDb = await getAllBlogs({ SKIP });
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

module.exports = BlogRouter;

// ??back??
