Task Management API

This is a Task Management REST API built using Node.js, Express, and TypeScript. The application allows users to manage projects and tasks with secure authentication, role-based access control, file uploads, and comments. It demonstrates RESTful API design, middleware usage, database integration with MongoDB, and environment-based configuration.

 Key Features  
 JWT-based authentication  
 Role-based access control (PM & Member)  
 Project creation and management  
 Task creation, assignment, update, and deletion  
 Controlled task status flow (todo → in_progress → in_review → done)  
 File uploads for task attachments  
 Comments on tasks  
 Dashboard APIs  
 Swagger API documentation  

Tech Stack  
Node.js, Express.js, TypeScript, MongoDB (Mongoose), JWT, Multer, Swagger (OpenAPI), dotenv  

Environment Variables  
Create a `.env` file in the root directory of the project and configure the following values:

PORT=3000  
MONGODB_URI=mongodb://localhost:27017/taskdb  
JWT_SECRET=your_jwt_secret  
JWT_EXPIRE=1d  
NODE_ENV=development  
UPLOAD_DIR=uploads  
MAX_FILE_SIZE=5242880  

API Documentation  
Swagger documentation is available at http://localhost:3000/api-docs and can be used to explore and test all available endpoints.

Run the Project  
Install dependencies and start the development server using:

npm install  
npm run dev  

The server will start at http://localhost:3000.

