const AccessSchema = require("../Schema/AccessSchema");

const rateLimitng = async (req, res, next) => {
  const sid = req.session.id;
  //find the entry in DB with sid
  //req.session.req_time === 'first'
  try {
    const accessDb = await AccessSchema.findOne({ sessionId: sid });

    if (!accessDb) {
      // req.session.req_time = Date.now()
      //if null, then R1 create an entry in db
      const accessObj = new AccessSchema({
        sessionId: sid,
        time: Date.now(),
      });

      await accessObj.save();
      next();
      return;
    }

    //R2--Rnth, compare the time with previous request

    const diff = (Date.now() - accessDb.time) / 1000;
    // 1 hit / 1sec
    if (diff < 1) {
      return res.send({
        status: 400,
        message: "Too many request, please wait for some time",
      });
    }

    //update the time
    await AccessSchema.findOneAndUpdate(
      { sessionId: sid },
      { time: Date.now() }
    );
    next();
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

module.exports = rateLimitng;
