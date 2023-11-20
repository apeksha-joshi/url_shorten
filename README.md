# URL Shortener

#### A URL Shortener simplifying the creation of concise links for long URLs. Built with Express.js and MongoDB, it supports URL shortening, viewing shortened URL history, seamless redirection, tier-based request limits, and optional user-preferred URL creation. User authentication is managed using JWT tokens. Explore the documentation for usage guidelines.

## Installation:

**Prerequisites:**

MongoDB and Node are prerequisites.

For installation, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/apeksha-joshi/url_shorten.git
    ```

2. Navigate to the project directory:
    ```bash
    cd project_directory/server
    ```

    **Note:**
- Each user has limited requests based on the tier they select during registration.
- In the Dev Environment, data for Teirs is inserted on run into the database.

3. Run `npm install` to install all dependencies from `package.json`:
    ```bash
    npm install
    ```

4. Depending on the environment you are running in, create a `.env.<environment>` file with the following details in the project directory: 

    ```env
    MONGO_CLOUD_URL=mongo_db_connection_url
    PORT=your_preferred_port
    JWT_SECRET=your_jwt_secret
    SESSION_SECRET=your_session_secret
    ```

 **Note** :For production, it uses `.env` file

5. Update the scripts in `package.json` if you add any new environments.


## Run the Application:

To start the URL Shortener application, use the following steps:

1. Run the application in production:
    ```bash
    npm start
    ```

    Run the application in production:
    ```bash
    npm run dev
    ```

2. The application will be accessible at `http://localhost:your_preferred_port`.

## Available Endpoints:

1. **Register a new User:**
   - **Endpoint:** `POST /api/auth/register`
   - **Example Request Body:**
     ```json
     {
       "firstName": "",
       "lastName": "",
       "email": "",
       "password": ""
     }
     ```

2. **Login:**
   - **Endpoint:** `POST /api/auth/login`
   - **Example Request Body:**
     ```json
     {
       "email": "",
       "password": ""
     }
     ```
3. **Initiate Password Reset:**
   - **Endpoint:** `POST /api/auth/forgot-password`
   - A reset token is returned. 

   **Note:** Ideally an email should be sent to the user with the link to reset the password.(will add this in the future)

4. **Password Reset:**
   - **Endpoint:** `POST /api/auth/reset-password`
   - **Example Request Body:**
     ```json
     {
       "resetToken": "",
       "password": ""
     }
     ```

5. **Logout:**
   - **Endpoint:** `GET /api/auth/logout`
   - **Description:** Logs out the user by clearing both the access token and refresh token from the database. Additionally, it removes the cookie set during login for a seamless logout experience.
   
   **Note:** Below endpoints require authentication using JWT tokens. Include the access token received after login/register in the header for these endpoints.
   - **Authorization Header:** `Bearer <accessToken>`

6. **Shorten a URL:**
   - **Endpoint:** `POST /api/urls/`
   - **Example Request Body:**
     ```json
     {
       "originalLink": "",
       "customName": ""
     }
     ```
     - **Note:** `customName` is optional. If provided and not already in use, it will be used; otherwise, a random name will be assigned.

7. **Get all URLs of the user:**
   - **Endpoint:** `GET /api/users/:userId/urls`
   -  Returns the URLs of the user with the specified `userId`. The `userId` and the `accessToken` should belong to the same user.

8. **Redirect to Original URL:**
   - **Endpoint:** `GET /api/urls/:urlCode`
   - Redirects to the original long URL.


9. **Refresh Access Token:**
   - **Endpoint:** `GET /api/auth/refresh-token`
   - **Note:** A cookie must be set to include the refreshToken of the user. In the Cookie, 'jwt' should have the refreshToken(received on login/register).





