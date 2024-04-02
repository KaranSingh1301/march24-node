const express = require("express");
const User = require("../Models/UserModel");
const FollowRouter = express.Router();
const { ObjectId } = require("mongodb");
const {
  followUser,
  followingUserList,
  followerUserList,
  unfollowUser,
} = require("../Models/FollowModel");

FollowRouter.post("/follow-user", async (req, res) => {
  const followingUserId = req.body.followingUserId;
  const followerUserId = req.session.user.userId;

  try {
    await User.findUserWithKeys({
      key: ObjectId.createFromHexString(followingUserId),
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Following user id not found",
      error: error,
    });
  }

  try {
    await User.findUserWithKeys({
      key: followerUserId,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 400,
      message: "Following user id not found",
      error: error,
    });
  }

  //create an entry within follow
  try {
    const followDb = await followUser({ followerUserId, followingUserId });

    return res.send({
      status: 201,
      message: "Follow Successfull",
      data: followDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

// //following-list?skip=5
FollowRouter.get("/following-list", async (req, res) => {
  const SKIP = parseInt(req.query.skip) || 0;
  const followerUserId = req.session.user.userId;

  try {
    const followDb = await followingUserList({ followerUserId, SKIP });

    return res.send({
      status: 200,
      message: "Read success",
      data: followDb,
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

FollowRouter.get("/follower-list", async (req, res) => {
  const SKIP = parseInt(req.query.skip) || 0;
  const followingUserId = req.session.user.userId;

  try {
    const followDb = await followerUserList({ followingUserId, SKIP });

    return res.send({
      status: 200,
      message: "Read success",
      data: followDb,
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

FollowRouter.post("/unfollow-user", async (req, res) => {
  const followerUserId = req.session.user.userId;
  const followingUserId = req.body.followingUserId;

  try {
    const followDb = await unfollowUser({ followerUserId, followingUserId });
    return res.send({
      status: 200,
      message: "Unfollow Successfull",
      data: followDb,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

module.exports = FollowRouter;

//test ---> test1
//test ---> test2

//test2 --->test
//test4 --->test
