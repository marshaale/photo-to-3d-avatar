import { AppError, BadRequestError, ExternalServiceError } from './error';

interface ReplicateFileOutput {
  url(): URL;
}

function isReplicateFileOutput(value: unknown): value is ReplicateFileOutput {
  return (
    typeof value === 'object' &&
    value !== null &&
    'url' in value &&
    typeof value.url === 'function'
  );
}

export function getRandomPrompt(prompts: readonly string[]): string {
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  if (!prompt) {
    throw new AppError(
      500,
      'REPLICATE_PROMPT_CONFIGURATION_ERROR',
      'No image generation prompts are configured',
    );
  }

  return prompt;
}

export function assertHttpImageUrl(value: string): void {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new BadRequestError('Image URL must be a valid HTTP(S) URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestError('Image URL must be a valid HTTP(S) URL');
  }
}

export function getReplicateImageUrl(output: unknown): string {
  const image = Array.isArray(output) ? output[0] : output;
  let imageUrl: string | undefined;

  if (typeof image === 'string') {
    imageUrl = image;
  } else if (isReplicateFileOutput(image)) {
    imageUrl = image.url().toString();
  } else if (
    typeof image === 'object' &&
    image !== null &&
    'url' in image &&
    typeof image.url === 'string'
  ) {
    imageUrl = image.url;
  }

  if (!imageUrl) {
    throw new ExternalServiceError(
      'Replicate returned no image URL',
      'replicate',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new ExternalServiceError(
      'Replicate returned an invalid image URL',
      'replicate',
    );
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new ExternalServiceError(
      'Replicate returned an unsupported image URL',
      'replicate',
    );
  }

  return parsedUrl.toString();
}
