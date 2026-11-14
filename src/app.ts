import { errorHandler, notFoundHandler } from '@/middlewares';
import { upload } from '@/middlewares/upload.middleware';
import { replicateService, s3Service } from '@/services';
import { BadRequestError, ExternalServiceError } from '@/utils';
import { openApiSpec } from '@/docs/openapi';
import compression from 'compression';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

const app = express();

const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

app.use(
  '/docs',
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        objectSrc: ["'none'"],
      },
    },
  }),
);
app.get('/docs/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// MIDDLEWARES

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());

// CORS
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: false,
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ROUTES

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Server is running',
    status: 'success',
    timestamp: new Date().toISOString(),
  });
});

app.post('/generate', upload.single('image'), async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new BadRequestError('An image file is required');
  }

  const fileExtension = imageExtensions[file.mimetype];
  if (!fileExtension) {
    throw new BadRequestError('Unsupported image file type');
  }

  const originalFile = await s3Service.uploadOriginalFile(
    file.buffer,
    fileExtension,
  );
  const originalImageUrl = await s3Service.getSignedUrl(originalFile.key);
  const generatedImageUrl =
    await replicateService.generateImage(originalImageUrl);

  const generatedImageResponse = await fetch(generatedImageUrl);
  if (!generatedImageResponse.ok) {
    throw new ExternalServiceError(
      'Failed to retrieve generated image',
      'replicate',
    );
  }

  const contentType = generatedImageResponse.headers
    .get('content-type')
    ?.split(';', 1)[0]
    ?.trim()
    .toLowerCase();
  const generatedFileExtension = contentType
    ? imageExtensions[contentType]
    : undefined;
  if (!generatedFileExtension) {
    throw new ExternalServiceError(
      'Replicate returned an unsupported image type',
      'replicate',
    );
  }

  const generatedImageBuffer = Buffer.from(
    await generatedImageResponse.arrayBuffer(),
  );
  const generatedFile = await s3Service.uploadGeneratedFile(
    generatedImageBuffer,
    generatedFileExtension,
  );
  const generatedS3ImageUrl = await s3Service.getSignedUrl(generatedFile.key);

  res.status(201).json({
    status: 'success',
    message: 'Avatar generated successfully',
    data: {
      originalImage: {
        key: originalFile.key,
        url: originalImageUrl,
      },
      generatedImage: {
        key: generatedFile.key,
        url: generatedS3ImageUrl,
      },
    },
  });
});

// 404 Routes
app.use(notFoundHandler);

// ERROR HANDLING
app.use(errorHandler);

export default app;
