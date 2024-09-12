const mongoose = require("mongoose");
const User = require("../../models/user.model");

module.exports = (socket) => {
  // Handle user connect
  socket.on("user/connect", async (data) => {
    console.log("User socket connect successful", data?.userId);

    try {
      const { userId } = data;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid user ID: ${userId}`);
      }

      console.log("connected", userId);
      socket.join(userId);
      socket.broadcast.to(userId).emit("user/inactivate", true);

      // Store userId in socket object
      socket.userId = userId;

      // Update user online status
      await User.updateOne({ _id: userId }, { $set: { online: true } });

      socket.broadcast.emit("user/connect", userId);
    } catch (error) {
      console.error(`Error in user/connect: ${error.message}`);
    }
  });

  // Handle user disconnect
  const handleDisconnect = async () => {
    try {
      const { userId } = socket;
      console.log(userId)
      console.log("User disconnected", userId);
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        // Update user online status
        await User.updateOne({ _id: userId }, { $set: { online: false } });

        socket.broadcast.emit("user/disconnect", userId);
      }
    } catch (error) {
      console.error(`Error in handleDisconnect: ${error.message}`);
    }
  };

  socket.on("disconnect", handleDisconnect);
  socket.on("user/disconnect", handleDisconnect);
};
