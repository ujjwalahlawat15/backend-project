# VidStream Backend 🎥

**VidStream Backend** is a complete backend system for a video hosting platform, inspired by YouTube.  
It is built with **Node.js, Express.js, MongoDB, and Mongoose** and follows industry-standard practices such as JWT authentication, access & refresh tokens, and secure password hashing with bcrypt.  

With VidStream, users can sign up, log in, upload videos, like/dislike, comment, reply, subscribe/unsubscribe — making it a **full-fledged backend system** for a scalable video platform.

---

## 🚀 Tech Stack
- **Backend Framework:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT (Access & Refresh Tokens), bcrypt  
- **File Uploads:** Multer / Cloud storage (if configured)  
- **Utilities:** dotenv, cookie-parser, error-handling middlewares  
- **Architecture:** Modular MVC pattern  

---

## ✨ Features
- 🔑 User Authentication (Signup/Login with JWT & bcrypt)  
- 🔄 Access & Refresh Token authentication system  
- 🎬 Video upload & management  
- 👍 Like / 👎 Dislike videos  
- 💬 Comment & Reply system  
- 📺 Subscribe / Unsubscribe channels  
- 🛠️ CRUD operations with proper validation  
- 🔐 Secure password hashing with bcrypt  
- ⚡ Error handling middleware  
- 🧩 Scalable and modular project structure  

---

⚙️ Setup Guide
1. Clone the repository
 ```
git clone https://github.com/ujjwalahlawat15/backend-project.git
cd backend-project

 ```

2. Install dependencies
 ```
npm install
```

3. Configure Environment Variables
Rename .env.example to .env and add your own values:
```
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLOUD_STORAGE_KEY=optional_if_used
```

4. Run the project
# Development mode (with nodemon)
```
npm run dev
```

# Production mode
```
npm start
```

5. Access the API
Once the server is running, open:
```
http://localhost:5000
```

📌 API Documentation

🔑 Auth Routes
| Endpoint                        | Method | Description                                        | Auth |
| ------------------------------- | ------ | -------------------------------------------------- | ---- |
| `/api/v1/users/register`        | POST   | Register new user with avatar & cover image upload | ❌    |
| `/api/v1/users/login`           | POST   | Login user and get tokens                          | ❌    |
| `/api/v1/users/logout`          | POST   | Logout user                                        | ✅    |
| `/api/v1/users/refresh-token`   | POST   | Generate new access token                          | ❌    |
| `/api/v1/users/change-password` | POST   | Change current password                            | ✅    |
| `/api/v1/users/current-user`    | GET    | Get logged-in user info                            | ✅    |
| `/api/v1/users/update-account`  | PATCH  | Update user account details                        | ✅    |
| `/api/v1/users/avatar`          | PATCH  | Update avatar                                      | ✅    |
| `/api/v1/users/cover-image`     | PATCH  | Update cover image                                 | ✅    |
| `/api/v1/users/c/:username`     | GET    | Get channel profile by username                    | ✅    |
| `/api/v1/users/history`         | GET    | Get watch history                                  | ✅    |

🎬 Video Routes
| Endpoint                                 | Method | Description                                    | Auth |
| ---------------------------------------- | ------ | ---------------------------------------------- | ---- |
| `/api/v1/videos`                         | GET    | Get all videos                                 | ✅    |
| `/api/v1/videos`                         | POST   | Publish a new video (upload video & thumbnail) | ✅    |
| `/api/v1/videos/:videoId`                | GET    | Get video details by ID                        | ✅    |
| `/api/v1/videos/:videoId`                | DELETE | Delete a video by ID                           | ✅    |
| `/api/v1/videos/:videoId`                | PATCH  | Update video details (thumbnail optional)      | ✅    |
| `/api/v1/videos/toggle/publish/:videoId` | PATCH  | Toggle video publish status                    | ✅    |

💬 Comment Routes
| Endpoint                        | Method | Description                  | Auth |
| ------------------------------- | ------ | ---------------------------- | ---- |
| `/api/v1/comments/:videoId`     | GET    | Get all comments for a video | ✅    |
| `/api/v1/comments/:videoId`     | POST   | Add comment on video         | ✅    |
| `/api/v1/comments/c/:commentId` | DELETE | Delete a comment             | ✅    |
| `/api/v1/comments/c/:commentId` | PATCH  | Update a comment             | ✅    |

👍 Like Routes
| Endpoint                            | Method | Description                  | Auth |
| ----------------------------------- | ------ | ---------------------------- | ---- |
| `/api/v1/likes/toggle/v/:videoId`   | POST   | Like/Unlike a video          | ✅    |
| `/api/v1/likes/toggle/c/:commentId` | POST   | Like/Unlike a comment        | ✅    |
| `/api/v1/likes/toggle/t/:tweetId`   | POST   | Like/Unlike a tweet          | ✅    |
| `/api/v1/likes/videos`              | GET    | Get all liked videos of user | ✅    |

📂 Playlist Routes
| Endpoint                                        | Method | Description                 | Auth |
| ----------------------------------------------- | ------ | --------------------------- | ---- |
| `/api/v1/playlists`                             | POST   | Create new playlist         | ✅    |
| `/api/v1/playlists/:playlistId`                 | GET    | Get playlist by ID          | ✅    |
| `/api/v1/playlists/:playlistId`                 | PATCH  | Update playlist details     | ✅    |
| `/api/v1/playlists/:playlistId`                 | DELETE | Delete a playlist           | ✅    |
| `/api/v1/playlists/add/:videoId/:playlistId`    | PATCH  | Add video to playlist       | ✅    |
| `/api/v1/playlists/remove/:videoId/:playlistId` | PATCH  | Remove video from playlist  | ✅    |
| `/api/v1/playlists/user/:userId`                | GET    | Get all playlists of a user | ✅    |

📺 Subscription Routes
| Endpoint                                | Method | Description                           | Auth |
| --------------------------------------- | ------ | ------------------------------------- | ---- |
| `/api/v1/subscriptions/c/:channelId`    | GET    | Get all subscribers of a channel      | ✅    |
| `/api/v1/subscriptions/c/:channelId`    | POST   | Subscribe/Unsubscribe to a channel    | ✅    |
| `/api/v1/subscriptions/u/:subscriberId` | GET    | Get all channels subscribed by a user | ✅    |

🐦 Tweet Routes
| Endpoint                      | Method | Description              | Auth |
| ----------------------------- | ------ | ------------------------ | ---- |
| `/api/v1/tweets`              | POST   | Create a new tweet       | ✅    |
| `/api/v1/tweets/user/:userId` | GET    | Get all tweets by a user | ✅    |
| `/api/v1/tweets/:tweetId`     | PATCH  | Update a tweet           | ✅    |
| `/api/v1/tweets/:tweetId`     | DELETE | Delete a tweet           | ✅    |

📊 Dashboard Routes
| Endpoint                   | Method | Description                 | Auth |
| -------------------------- | ------ | --------------------------- | ---- |
| `/api/v1/dashboard/stats`  | GET    | Get channel stats           | ✅    |
| `/api/v1/dashboard/videos` | GET    | Get all videos of a channel | ✅    |

❤️ Healthcheck
| Endpoint              | Method | Description                 | Auth |
| --------------------- | ------ | --------------------------- | ---- |
| `/api/v1/healthcheck` | GET    | Check if service is running | ❌    |


