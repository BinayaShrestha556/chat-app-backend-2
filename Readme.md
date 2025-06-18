# E-Commerce Backend API

This repository hosts the backend API for an E-Commerce platform, built with Node.js, Express, and TypeScript. It provides robust functionalities for user authentication, user management, and real-time messaging, crucial for a dynamic e-commerce experience.

## Features

- **User Authentication**: Secure signup, login, logout, token refresh, and user session management using JWT.

- **User Management**: Retrieve authenticated user details and search for other users.

- **Messaging System**: Create conversations, send messages, and retrieve conversation history between users.

- **Real-time Communication**: Integrated with Socket.io for instant message delivery and interactive user experiences.

- **Database Integration**: Utilizes Prisma ORM for efficient and type-safe database interactions.

## Technologies Used

- **Node.js**: JavaScript runtime environment.

- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.

- **TypeScript**: Superset of JavaScript that adds static types.

- **Prisma**: Next-generation ORM for Node.js and TypeScript.

- **JWT (JSON Web Tokens)**: For secure authentication and authorization.

- **Socket.io**: For real-time, bidirectional event-based communication.

- **bcryptjs**: For password hashing.

- **jsonwebtoken**: For handling JWTs.

## API Endpoints

The API is organized into several modules, each handling specific functionalities. All authenticated routes require a valid access token in the request cookies.

### 1. Authentication Endpoints

Base Path: `/api/auth`

| Method | Endpoint            | Description                                                                                                        | Authentication Required | Request Body                                                            | Successful Response (Status: 200/201)                                                                               | Error Responses (Status: 400/401/403/404/500)                                                                                                                                      |
| :----- | :------------------ | :----------------------------------------------------------------------------------------------------------------- | :---------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/get-user`         | Retrieves details of the authenticated user.                                                                       | Yes                     | None                                                                    | `{ id: string, fullname: string, username: string, profilePic: string }`                                            | `404 Not Found`: `{ error: "user not found" }`<br>`500 Server Error`: `{ error: "Server Error!!" }`                                                                                |
| `POST` | `/login`            | Logs in a user, authenticates credentials, and issues access and refresh tokens.                                   | No                      | `{ username: string, password: string }`                                | `{ refreshToken: string, accessToken: string, id: string, fullname: string, username: string, profilePic: string }` | `400 Bad Request`: `{ error: "Provide credentials" }`, `{ error: "User doesnt exist" }`, `{ error: "Incorrect Credentials" }`<br>`500 Server Error`: `{ error: "Server Error!!" }` |
| `POST` | `/logout`           | Logs out a user by clearing authentication cookies.                                                                | No                      | None                                                                    | `{ message: "Logged out successfully." }`                                                                           | `500 Server Error`: `"something went wrong"`                                                                                                                                       |
| `POST` | `/signup`           | Registers a new user, hashes password, and creates an initial avatar.                                              | No                      | `{ fullname: string, username: string, password: string, gender: "male" | "female" }`                                                                                                         | `{ refreshToken: string, accessToken: string, id: string, username: string, profilePic: string, gender: string, fullname: string }`                                                | `400 Bad Request`: `{ error: "Please fill in all fields." }`, `{ error: "User already exists." }`, `{ error: "invalid data" }`<br>`500 Server Error`: `{ error: "Server Error!!" }` |
| `POST` | `/refresh`          | Refreshes an expired access token using a valid refresh token.                                                     | No                      | None (token from `Authorization` header or `refreshToken` cookie)       | `{ accessToken: string }`                                                                                           | `401 Unauthorized`: `{ error: "Unauthorized: No token provided" }`<br>`403 Forbidden`: `{ error: "Invalid refresh token" }`<br>`400 Bad Request`: `{ error: "user not found." }`   |
| `POST` | `/validate-refresh` | Validates the current access token (or refresh token if `accessToken` cookie is missing) for session health check. | No                      | None (token from `Authorization` header or `accessToken` cookie)        | `{ message: "verified" }`                                                                                           | `401 Unauthorized`: `{ error: "Unauthorized: No token provided" }`<br>`403 Forbidden`: `{ error: "Invalid refresh token" }`<br>`400 Bad Request`: `{ error: "user not found." }`   |

### 2. User Endpoints

Base Path: `/api/users`

| Method | Endpoint                | Description                                       | Authentication Required | Request Body/Query                                                                    | Successful Response (Status: 200)                                                          | Error Responses (Status: 400/404/500)                                                                                                         |
| :----- | :---------------------- | :------------------------------------------------ | :---------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/get-user-details/:id` | Retrieves details of a specific user by their ID. | No                      | URL Param: `id`                                                                       | `{ id: string, fullname: string, username: string, gender: string, profilePic: string }`   | `400 Bad Request`: `{ error: "provide proper id" }`, `{ error: "user not found" }`<br>`500 Server Error`: `{ error: "something went wrong" }` |
| `GET`  | `/search`               | Searches for users by username.                   | No                      | Query Param: `q` (search query), `dontInclude` (optional, ID to exclude from results) | `[{ id: string, fullname: string, gender: string, profilePic: string, username: string }]` | `400 Bad Request`: `{ error: "provide some search query" }`<br>`500 Server Error`: `{ error: "Something went wrong" }`                        |

### 3. Message Endpoints

Base Path: `/api/messages`

| Method | Endpoint               | Description                                                                                                   | Authentication Required | Request Body/Query                                                                                 | Successful Response (Status: 200/201)                                                                                                                                                                                                                   | Error Responses (Status: 400/401/404/500)                                                                                                                              |
| :----- | :--------------------- | :------------------------------------------------------------------------------------------------------------ | :---------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/send-message/:id`    | Sends a message from the authenticated user to another user. If no conversation exists, a new one is created. | Yes                     | URL Param: `id` (receiver's user ID)<br>Body: `{ message: string }`                                | `{ id: string, senderId: string, body: string, conversationId: string, createdAt: string }`                                                                                                                                                             | `400 Bad Request`: `{ error: "User not authenticated" }`, `{ error: "provide all details" }`<br>`500 Server Error`: `{ error: "Server Error!!" }`                      |
| `GET`  | `/get-conversations`   | Retrieves all conversations for the authenticated user, including the last message and participants.          | Yes                     | None                                                                                               | `[{ id: string, participants: [{ id: string, username: string, fullname: string, profilePic: string }], messages: [{ id: string, senderId: string, body: string, conversationId: string, createdAt: string }], updatedAt: string, createdAt: string }]` | `404 Not Found`: `{ error: "Conversation not found." }`<br>`500 Server Error`: `{ error: "Server Error!!" }`                                                           |
| `GET`  | `/get-messages/:id`    | Retrieves all messages within a specific conversation.                                                        | Yes                     | URL Param: `id` (conversation ID)                                                                  | `{ id: string, participants: [{ id: string, fullname: string, username: string, profilePic: string }], messages: [{ id: string, senderId: string, body: string, conversationId: string, createdAt: string }], createdAt: string }`                      | `400 Bad Request`: `{ error: "Not logged in." }`<br>`404 Not Found`: `{ error: "Conversation not found." }`<br>`500 Server Error`: `{ error: "Server Error!!" }`       |
| `POST` | `/create-conversation` | Initiates a new conversation among specified users. Checks for existing conversations.                        | Yes                     | Body: `{ users: string[] }` (array of participant user IDs, including the authenticated user's ID) | `{ id: string, exists: boolean }` ( `exists` is `true` if conversation already exists, `false` if newly created)                                                                                                                                        | `401 Unauthorized`: `{ error: "Not your chat" }`<br>`404 Not Found`: `{ error: "User {id} doesn't exist" }`<br>`500 Server Error`: `{ error: "Something went wrong" }` |

## Real-time Communication (Socket.io)

The backend also implements Socket.io for real-time features, primarily for messaging.

**Connection and Authentication:**
The Socket.io server authenticates connections using JWT tokens present in cookies, similar to the HTTP API. It validates the `accessToken` cookie (or `Authorization` header if a bearer token is present) upon connection. If the token is invalid or missing, the connection is rejected.

**Events:**

| Event Name        | Description                                                                                                                                                                                                                             | Parameters (Client to Server)                                                                         | Parameters (Server to Client)                                                                                                                            |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `join-room`       | Joins the client to a specific conversation room. Subsequent messages sent to this `conversationId` will be received by this client.                                                                                                    | `conversationId: string`                                                                              | None                                                                                                                                                     |
| `leave-room`      | Leaves a specific conversation room, stopping further message reception for that room.                                                                                                                                                  | `conversationId: string`                                                                              | None                                                                                                                                                     |
| `join-all-rooms`  | Joins the client to multiple conversation rooms simultaneously. Useful for initializing a user's active conversations upon login.                                                                                                       | `conversationIds: string[]` (An array of conversation IDs)                                            | None                                                                                                                                                     |
| `send-message`    | Sends a new message from the authenticated user. The server will save the message to the database and then broadcast it to all clients in the target `roomId`. Requires the sending user to be authenticated via the socket connection. | `{ roomId: string, message: string, pic?: string }` (`pic` is optional, likely for image attachments) | None                                                                                                                                                     |
| `receive-message` | Broadcasts a new message to all clients in a specific conversation room. This event is emitted by the server _after_ a `send-message` event is processed and the message is saved.                                                      | None                                                                                                  | `{ conversationId: string, newMessage: object }` (where `newMessage` includes `id`, `senderId`, `body`, `pic`, `createdAt` of the newly created message) |
| `disconnect`      | Fired when a client disconnects from the Socket.io server.                                                                                                                                                                              | None                                                                                                  | None                                                                                                                                                     |

## Installation

To set up the project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/BinayaShrestha556/e-commerce-cms.git](https://github.com/BinayaShrestha556/e-commerce-cms.git) # Assuming this is the correct repo
    cd e-commerce-cms # Navigate to the backend directory if it's nested
    ```

2.  **Install dependencies:**

    ```bash
    npm install # or yarn install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and configure the following environment variables:

    ```env
    DATABASE_URL="your_database_connection_string"
    ACCESS_TOKEN_SECRET="your_jwt_access_token_secret"
    REFRESH_TOKEN_SECRET="your_jwt_refresh_token_secret"
    JWT_SECRET="a_strong_secret_for_refresh_token_verification" # Used for refresh token verification
    CORS_ORIGIN="http://localhost:3000,[http://yourfrontend.com](http://yourfrontend.com)" # Adjust for your frontend URL(s)
    # Add any other necessary environment variables for mail, etc.
    ```

4.  **Database Setup:**
    Run Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

    Or, if you have existing migrations, just run:

    ```bash
    npx prisma db push
    ```

5.  **Run the server:**

    ```bash
    npm run dev # or yarn dev
    ```

    The server should now be running, typically on `http://localhost:5000` (or as configured).

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.

2.  Create a new branch (`git checkout -b feature/your-feature-name`).

3.  Make your changes.

4.  Commit your changes (`git commit -m 'feat: Add new feature'`).

5.  Push to the branch (`git push origin feature/your-feature-name`).

6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
