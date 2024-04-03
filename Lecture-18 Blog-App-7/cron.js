const cron = require("node-cron");
const BlogSchema = require("./Schema/BlogSchema");

function cleanUpBin() {
  cron.schedule("* 0 * * *", async () => {
    const deletedBlogs = await BlogSchema.find({ isDeleted: true });

    if (deletedBlogs.length > 0) {
      let deletedBlogsId = [];
      deletedBlogs.map((blog) => {
        const diff =
          (Date.now() - blog.deletionDateTime.getTime()) /
          (1000 * 60 * 60 * 24);
        if (diff > 30) {
          //days
          deletedBlogsId.push(blog._id);
        }
      });

      if (deletedBlogsId.length > 0) {
        try {
          const deletedBlog = await BlogSchema.findOneAndDelete({
            _id: { $in: deletedBlogsId },
          });
          console.log(`Blogs has been deleted BlogId : ${deletedBlog._id}`);
        } catch (error) {
          console.log(error);
        }
      }
    }
  });
}

module.exports = cleanUpBin;
