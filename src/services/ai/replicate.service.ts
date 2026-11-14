import Replicate from 'replicate';
import { config } from '@/config';
import {
  AppError,
  assertHttpImageUrl,
  ExternalServiceError,
  getRandomPrompt,
  getReplicateImageUrl,
} from '@/utils';

class ReplicateService {
  private readonly replicate: Replicate;

  private readonly systemPrompts: string[] = [
    `Transform the uploaded photo into a premium 3D avatar profile picture.
     Preserve the person's recognizable facial features, identity, hairstyle,
     skin tone, and overall appearance.
     Create a polished, stylized 3D character with smooth realistic textures,
     expressive eyes, professional studio lighting, and a clean background.
     Use a modern Pixar-inspired 3D aesthetic without exaggerating facial features.
     Center the head and shoulders, making it suitable for a social media profile.`,

    `Convert the uploaded person's photo into a high-quality 3D animated avatar.
     Maintain strong facial resemblance, original hairstyle, skin tone,
     and distinctive facial characteristics.
     Use a sophisticated 3D character design, soft cinematic lighting,
     detailed skin textures, subtle depth, and a beautiful neutral background.
     Frame the avatar from the shoulders upward, centered and facing forward.`,

    `Create a professional 3D cartoon-style profile avatar based on the uploaded photo.
     Preserve the subject's identity, facial proportions, hairstyle, and skin tone.
     Render a beautifully detailed 3D character with natural expressions,
     refined materials, balanced lighting, and a premium animated appearance.
     Use a minimal gradient background and a centered head-and-shoulders composition.`,

    `Reimagine the uploaded photo as a premium modern 3D digital character portrait.
     Keep the person's identity recognizable, including facial structure,
     hairstyle, skin tone, and unique physical characteristics.
     Apply polished 3D rendering, realistic ambient lighting, subtle shadows,
     smooth yet detailed textures, and an elegant professional aesthetic.
     Create a square, centered profile picture with a simple background.`,
  ];

  constructor() {
    if (!config.REPLICATE_API_KEY) {
      throw new AppError(
        500,
        'REPLICATE_CONFIGURATION_ERROR',
        'Replicate API key is not configured',
      );
    }

    this.replicate = new Replicate({
      auth: config.REPLICATE_API_KEY,
    });
  }

  async generateImage(imgUrl: string): Promise<string> {
    assertHttpImageUrl(imgUrl);

    try {
      const systemPrompt = getRandomPrompt(this.systemPrompts);

      const input = {
        prompt: systemPrompt,
        resolution: '1K',
        image_input: [imgUrl],
        aspect_ratio: '1:1',
        output_format: 'png',
        safety_filter_level: 'block_only_high',
        allow_fallback_model: false,
      };

      const output = await this.replicate.run('google/nano-banana-pro', {
        input,
      });

      return getReplicateImageUrl(output);
    } catch (error) {
      console.error('Replicate image generation failed', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new ExternalServiceError(
        'Failed to generate 3D avatar',
        'replicate',
      );
    }
  }
}

export const replicateService = new ReplicateService();
