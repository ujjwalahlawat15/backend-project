
import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if(!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const comments = await Comment.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likesData"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                isLikedByMe: userId ? { $in: [userId, "$likesData.likedBy"] } : false,
                likesCount: { $size: "$likesData" },
                owner: {$first: "$ownerDetails"}
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: 1,
                isLikedByMe: 1,
                likesCount: 1
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
    ]);

    const totalComments = await Comment.countDocuments({ video: new mongoose.Types.ObjectId(videoId) });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                totalComments,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalComments / limit)
            },
            "Comments retrieved successfully"
        )
    );

    

})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if(!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if(!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            comment,
            "Comment added successfully"
        )
    );

})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if(!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    if(!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

   /* const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.content = content;
    await comment.save();*/

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id},
        {content: content.trim()},
        {new: true}
    );

    if(!comment){
        throw new ApiError(404, "Comment not found or you're not allowed to edit this comment");
    }



    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commnet ID");
    }

    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId, owner: req.user._id
    });

    if(!deletedComment){
        throw new ApiError(404, "Comment not found or you're not allowed to delete this comment");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
