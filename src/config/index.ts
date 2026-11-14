import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  REPLICATE_API_KEY: process.env.REPLICATE_API_KEY || '',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '5242880', 10), // 5MB default
    maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || '1', 10), // 1 file default
    allowedFilesMimeTypes: (
      process.env.UPLOAD_ALLOWED_MIME_TYPES || 'image/jpeg,image/png'
    ).split(','),
  },
};
