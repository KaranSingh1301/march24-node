const { LIMIT } = require("../PrivateConstants");
const FollowSchema = require("../Schema/FollowSchema");
const UserSchema = require("../Schema/UserSchema");

const followUser = ({ followerUserId, followingUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check if A ---> B
      const followExist = await FollowSchema.findOne({
        followerUserId,
        followingUserId,
      });
      if (followExist) return reject("Already following the user");

      const followObj = new FollowSchema({
        followerUserId,
        followingUserId,
        creationDateTime: Date.now(),
      });

      const followDb = await followObj.save();
      resolve(followDb);
    } catch (error) {
      reject(error);
    }
  });
};

const followingUserList = ({ followerUserId, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      ///match, sort, pagination;
      const followingList = await FollowSchema.aggregate([
        {
          $match: { followerUserId: followerUserId },
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
      console.log(followingList[0].data);

      //populate
      //   const followingUserDetails = await FollowSchema.find({
      //     followerUserId,
      //   }).populate("followingUserId");

      let followingUserIdsList = [];
      followingList[0].data.map((item) => {
        followingUserIdsList.push(item.followingUserId);
      });
      console.log(followingUserIdsList);

      const followingUserDetails = await UserSchema.find({
        _id: { $in: followingUserIdsList },
      });

      console.log(followingUserDetails);
      resolve(followingUserDetails.reverse());
    } catch (error) {
      reject(error);
    }
  });
};

const followerUserList = ({ followingUserId, SKIP }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followersList = await FollowSchema.aggregate([
        {
          $match: { followingUserId: followingUserId },
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
      console.log(followersList[0].data);
      const followerUserIds = followersList[0].data.map(
        (item) => item.followerUserId
      );
      console.log(followerUserIds);
      const followerUserDetails = await UserSchema.find({
        _id: { $in: followerUserIds },
      });
      console.log(followerUserDetails);
      resolve(followerUserDetails.reverse());
    } catch (error) {
      reject(error);
    }
  });
};

const unfollowUser = ({ followerUserId, followingUserId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const followDb = await FollowSchema.findOneAndDelete({
        followerUserId,
        followingUserId,
      });
      resolve(followDb);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  followUser,
  followingUserList,
  followerUserList,
  unfollowUser,
};
