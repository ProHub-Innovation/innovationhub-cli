import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinaryType } from 'cloudinary';
import { ERRORS } from '../common/constants/errors.constants';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinaryType,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException(ERRORS.IMAGE.REQUIRED);
    }

    const fileBase64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${fileBase64}`;

    return this.cloudinaryInstance.uploader.upload(dataUri, {
      folder: folder,
      resource_type: 'image',
    });
  }

  async deleteImage(publicId: string): Promise<{ result: string }> {
    return this.cloudinaryInstance.uploader.destroy(publicId) as Promise<{
      result: string;
    }>;
  }

  async replaceImage(
    file: Express.Multer.File,
    folder: string,
    oldPublicId?: string,
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new BadRequestException(ERRORS.IMAGE.REQUIRED);
    }
    if (oldPublicId) {
      await this.deleteImage(oldPublicId);
    }
    return this.uploadImage(file, folder);
  }

  async deleteImages(publicIds: string[]): Promise<Record<string, unknown>> {
    if (!publicIds.length) return {};
    return this.cloudinaryInstance.api.delete_resources(publicIds) as Promise<
      Record<string, unknown>
    >;
  }
}
