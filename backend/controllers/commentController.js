const Comment = require("../model/commentModel");
const hotels = require("../model/hotelModel");

const createComment = async (req, res) => {
  try {
    const comment = new Comment({
      user: req.user.id,
      hotel: req.body.hotelId,
      comment: req.body.comment,
    });

    await comment.save();

    const updatedHotel = await hotels.findByIdAndUpdate(
      req.body.hotelId,
      { $push: { comments: comment._id } },
      { new: true }
    );

    if (updatedHotel) {
      res.json({
        success: true,
        message: "Comment created successfully",
      });
    } else {
      res.json({
        success: false,
        message: "Hotel not found",
      });
    }
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: "Comment not created",
    });
  }
};

module.exports = {
    createComment,
}
