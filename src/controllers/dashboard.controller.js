import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    const viewsAgg = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalViews = viewsAgg.length > 0 ? viewsAgg[0].totalViews : 0;

    const totalVideos = await Video.countDocuments({ owner: new mongoose.Types.ObjectId(channelId) });

    const totalSubscribers = await Subscription.countDocuments({ channel: new mongoose.Types.ObjectId(channelId) });

    return res.status(200).json(new ApiResponse(200, {
        totalViews,
        totalVideos,
        totalSubscribers
    }, "Channel stats fetched successfully"));


})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;
   // const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const videos = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true
             }
        },
        {
            $sort: { createdAt: -1}
        },
        {
            $project: {
                title: 1,
                thumbnail: 1,
                views: 1,
                createdAt: 1,
                duration: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
})



export {
    getChannelStats, 
    getChannelVideos
    }