const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { blocklistService, chatService } = require("../services");
const response = require("../config/response");

const addChat = catchAsync(async (req, res) => {
  const senderId = req.user.id;
  const receiverId = req.body.receiverId;
  const participants = [senderId, receiverId];
  const existingChat = await chatService.getChatByParticipants(participants);
  if (existingChat) {
    return res.status(httpStatus.CREATED).json(
      response({
        message: "Chat already exists",
        status: "OK",
        statusCode: httpStatus.OK,
        data: existingChat,
      })
    );
  }
  const chatBody = { participants: participants };
  const chat = await chatService.addChat(chatBody);
  return res.status(httpStatus.CREATED).json(
    response({
      message: "Chat created successful",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: chat,
    })
  );
});

const getChats = catchAsync(async (req, res) => {
  const receiver = req.user.id;
  const options = pick(req.query, ["createdAt", "limit", "page"]);
  const filter = { participants: { $in: [req.user.id] }, status: "accepted" };
  const chatResult = await chatService.getChats(filter, options, receiver);

  res.status(httpStatus.OK).json(
    response({
      code: httpStatus.OK,
      message: "Chat successfully retrieved",
      data: chatResult,
    })
  );
});

const getChat = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  const chat = await chatService.getChat(userId, chatId);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Chat retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: chat,
    })
  );
});

const updateChat = catchAsync(async (req, res) => {
  const chat = await chatService.getChatById(req.params.chatId);
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat not found");
  }
  const { status } = req.body;
  if (status && status !== chat.status && status === "blocked") {
    chat.status = status;
  }
  await chat.save();
  const profileId = chat.participants.filter(
    (participant) => participant != req.user.id
  );
  await blocklistService.blocked({ profileId: profileId }, req.user.id);
  res.status(httpStatus.OK).json(
    response({
      message: "Chat updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: chat,
    })
  );
});

const deleteChat = catchAsync(async (req, res) => {
  const chat = await chatService.getChatByDeleteId(
    req.body.chatId,
    req.user.id
  );
  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Chat deleted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: chat,
    })
  );
});

module.exports = {
  getChats,
  deleteChat,
  updateChat,
  addChat,
  getChat, // Export the new getChat function
};
