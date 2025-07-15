import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/infrastructure/integrates/supabase/supabase.service';

@Injectable()
export class UploadImageUseCase {
    constructor(private readonly supabaseService: SupabaseService) {}

    async execute(
        file: Express.Multer.File
    ): Promise<{ fileKey: string; publicUrl: string; originalName: string }> {
        try {
            if (!file) {
                throw new HttpException(
                    'Image file is required',
                    HttpStatus.BAD_REQUEST
                );
            }

            // Validate file type for images
            const allowedMimeTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
            ];

            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new HttpException(
                    'Only image files are allowed (JPEG, PNG, GIF, WebP)',
                    HttpStatus.BAD_REQUEST
                );
            }

            const uploadResult = await this.supabaseService.uploadFile(file);

            if (!uploadResult.success) {
                throw new HttpException(
                    uploadResult.error || 'Failed to upload image',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            const publicUrlResult = await this.supabaseService.getPublicUrl(
                uploadResult.data!.key
            );

            if (!publicUrlResult.success) {
                throw new HttpException(
                    publicUrlResult.error || 'Failed to get public URL',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return {
                fileKey: uploadResult.data!.key,
                publicUrl: publicUrlResult.data!,
                originalName: uploadResult.data!.originalName,
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to upload image',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
