export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Photo to 3D Avatar API',
    version: '1.0.0',
    description: 'Upload a photo and generate a 3D avatar.',
  },
  servers: [{ url: '/' }],
  paths: {
    '/': {
      get: {
        summary: 'Check API health',
        responses: {
          '200': {
            description: 'The API is running.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    status: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/generate': {
      post: {
        summary: 'Generate a 3D avatar from an uploaded image',
        operationId: 'generateAvatar',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description:
                      'A JPEG or PNG image, up to the configured upload limit.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description:
              'Avatar generated successfully. Signed URLs expire after one hour.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status', 'message', 'data'],
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        originalImage: {
                          $ref: '#/components/schemas/ImageReference',
                        },
                        generatedImage: {
                          $ref: '#/components/schemas/ImageReference',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description:
              'Missing image, unsupported image type, or upload limit exceeded.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '502': {
            description:
              'An external image generation or storage service failed.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ImageReference: {
        type: 'object',
        required: ['key', 'url'],
        properties: {
          key: { type: 'string' },
          url: { type: 'string', format: 'uri' },
        },
      },
      Error: {
        type: 'object',
        required: ['message', 'code'],
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
        },
      },
    },
  },
};
