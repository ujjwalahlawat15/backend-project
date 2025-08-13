
import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    res.status(200).json(new ApiResponse(201, "Tweet created successfully", tweet));

})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
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
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            _id: 0
                        }
                    }

                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$ownerDetails"
                }
            }
        },
        {
            $project: {
                likes: 0,
                ownerDetails: 0,
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])

    if (!tweets.length) {
        throw new ApiError(404, "No tweets found for this user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }
    /* const updatedTweet = await Tweet.findByIdAndUpdate(
         tweetId,
         { content },
         { new: true, runValidators: true } // new:true → updated doc return karega
     );
 
     if (!updatedTweet) {
         return res.status(404).json({ message: "Tweet not found" });
     } */

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this tweet");
    }

    tweet.content = content;
    await tweet.save();

    res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    /*const deletedTweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id // ownership check in query
    });

    if (!deletedTweet) {
        return res.status(404).json({ message: "Tweet not found or you are not authorized" });
    }*/

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this tweet");
    }

    await tweet.deleteOne();

    res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
