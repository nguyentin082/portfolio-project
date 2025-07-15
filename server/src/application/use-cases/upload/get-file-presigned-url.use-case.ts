import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../infrastructure/integrates/supabase/supabase.service';

@Injectable()
export class GeneratePresignedUrlUseCase {
    constructor(private readonly supabaseService: SupabaseService) {}

    async execute(metadata: {
        fileKey: string;
        expiresIn?: number;
    }): Promise<{ fileKey: string; presignedUrl: string }> {
        try {
            if (!metadata.fileKey) {
                throw new HttpException(
                    'fileKey is required',
                    HttpStatus.BAD_REQUEST
                );
            }

            const result = await this.supabaseService.getSignedUrl(
                metadata.fileKey,
                metadata.expiresIn || 3600 * 24 * 7 // 7 days
            );

            if (!result.success) {
                throw new HttpException(
                    result.error || 'Failed to generate presigned URL',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return { fileKey: metadata.fileKey, presignedUrl: result.data! };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to generate presigned URL',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async executeMultiple(metadata: {
        fileKeys: string[];
        expiresIn?: number;
    }): Promise<{ fileKey: string; presignedUrl: string }[]> {
        const result = await Promise.all(
            metadata.fileKeys.map(async (fileKey) => {
                return this.execute({ fileKey, expiresIn: metadata.expiresIn });
            })
        );

        return result;
    }
}
