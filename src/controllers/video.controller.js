import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

// GET ALL VIDEOS - with pagination, query, sort, filter by user
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const matchQuery = {
        isPublished: true
    };

    if (query) {
        matchQuery.title = { $regex: query, $options: "i" };
    }

    if (userId && isValidObjectId(userId)) {
        matchQuery.owner = new mongoose.Types.ObjectId(userId);
    }

    const result = await Video.aggregatePaginate(
        Video.aggregate([
            { $match: matchQuery },
            { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } }
        ]),
        { page: parseInt(page), limit: parseInt(limit) }
    );

    res.status(200).json(new ApiResponse(200, result, "Videos fetched successfully"));
});

// PUBLISH A VIDEO - upload file and create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoUpload?.url || !thumbnailUpload?.url) {
        throw new ApiError(500, "Cloudinary upload failed");
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        duration: Math.floor(videoUpload.duration), // if Cloudinary gives duration
        owner: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

// GET VIDEO BY ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username fullName avatar");

    if (!video) throw new ApiError(404, "Video not found");

    res.status(200).json(new ApiResponse(200, video, "Video fetched"));
});

// UPDATE VIDEO
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    const { title, description } = req.body;

    if (title) video.title = title;
    if (description) video.description = description;

    // thumbnail update
    const newThumbnail = req.files?.thumbnail?.[0]?.path;
    if (newThumbnail) {
        const uploaded = await uploadOnCloudinary(newThumbnail);
        if (!uploaded?.url) throw new ApiError(500, "Failed to upload thumbnail");
        video.thumbnail = uploaded.url;
    }

    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

// DELETE VIDEO
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not the owner of this video");
    }

    await video.deleteOne();

    res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// TOGGLE PUBLISH STATUS
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, `Video is now ${video.isPublished ? 'Published' : 'Unpublished'}`));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
