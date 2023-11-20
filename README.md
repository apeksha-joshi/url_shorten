# URL Shortener

#### A URL Shortener simplifying the creation of concise links for long URLs. Built with Express.js and MongoDB, it supports URL shortening, viewing shortened URL history, seamless redirection, tier-based request limits, and optional user-preferred URL creation. User authentication is managed using JWT tokens. Explore the documentation for usage guidelines.A URL Shortener simplifying the creation of concise links for long URLs. Built with Express.js and MongoDB, it supports URL shortening, viewing shortened URL history, seamless redirection, tier-based request limits, and optional user-preferred URL creation. User authentication is managed using JWT tokens. Explore the documentation for usage guidelines.

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
    cd project_directory
    ```

3. Run `npm install` to install all dependencies from `package.json`:
    ```bash
    npm install
    ```

4. Depending on the environment you are running in, create a `.env` file with the following details:

    ```env
    MONGO_CLOUD_URL=mongo_db_connection_url
    PORT=your_preferred_port
    JWT_SECRET=your_jwt_secret
    SESSION_SECRET=your_session_secret
    ```

    Update the values accordingly.

5. Update the scripts in `package.json` if you add any new environments.


## Run the Application:

To start the URL Shortener application, use the following steps:

1. Run the application:
    ```bash
    npm start
    ```

2. The application will be accessible at `http://localhost:your_preferred_port`.

