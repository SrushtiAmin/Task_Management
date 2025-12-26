import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API documentation for Task Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],

    // THIS CONTROLS ORDER
    tags: [
      { name: 'Authentication', description: 'User authentication APIs' },
      { name: 'Projects', description: 'Project management APIs' },
      { name: 'Tasks', description: 'Task management APIs' },
      { name: 'Comments', description: 'Task comments APIs' },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // correct glob
  apis: ['./src/swagger/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
