import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    let like = await Like.findOne({ video: videoId, likedBy: userId });

    if (like) {
        // Unlike the video
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    } else {
        // Like the video
        like = await Like.create({ video: videoId, likedBy: userId });
        return res.status(201).json(new ApiResponse(201, like, "Video liked successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    let like = await Like.findOne({ comment: commentId, likedBy: userId });

    if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    } else {
        like = await Like.create({ comment: commentId, likedBy: userId });
        return res.status(201).json(new ApiResponse(201, like, "Comment liked successfully"));
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    let like = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (like) {
        await Like.deleteOne({ _id: like._id });
        return res.status(200).json(new ApiResponse(200, null, "Tweet unliked successfully"));
    } else {
        like = await Like.create({ tweet: tweetId, likedBy: userId });
        return res.status(201).json(new ApiResponse(201, like, "Tweet liked successfully"));
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = mongoose.Types.ObjectId(req.user._id);

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: { $exists: true }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$ownerDetails" }
                        }
                    },
                    {
                        $project: {
                            ownerDetails: 0
                        }
                    }
                ]
            }
        },

        {
            $group: {
                _id: "$likedBy",
                likedBy: { $first: "$likedBy" },
                totalVideos: { $sum: 1 },
                updatedAt: { $max: "$updatedAt" },
                videos: { $push: { $first: "$videoDetails" } } // array of video objects
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likedBy",
                foreignField: "_id",
                as: "likedByDetails",
                pipeline: [
                    {
                        $project: {
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likedBy: { $first: "$likedByDetails" }
            }
        },
        {
            $project: {
                likedByDetails: 0,
            }
        }
    ])

    if (likedVideos.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No liked videos found"));
    }
    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}