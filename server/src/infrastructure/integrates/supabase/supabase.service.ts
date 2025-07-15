import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseService {
    private readonly supabase: SupabaseClient;
    private readonly bucketName: string;
    private readonly logger = new Logger(SupabaseService.name);
    private readonly storageFolder = 'face-recognition';

    constructor(private readonly configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
        this.bucketName =
            this.configService.get<string>('SUPABASE_BUCKET_NAME') ||
            'portfolio-projects';

        if (!supabaseUrl || !supabaseKey) {
            throw new Error(
                'Supabase URL and Key must be provided in environment variables'
            );
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized successfully');
    }

    async uploadFile(file: Express.Multer.File): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }> {
        try {
            const fileKey = `${this.storageFolder}/${uuidv4()}-${
                file.originalname
            }`;

            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileKey, file.buffer, {
                    contentType: file.mimetype,
                    duplex: 'half',
                });

            if (error) {
                this.logger.error('Error uploading file to Supabase:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            this.logger.log(`File uploaded successfully: ${fileKey}`);
            return {
                success: true,
                data: {
                    path: data.path,
                    fullPath: data.fullPath,
                    id: data.id,
                    key: fileKey,
                    originalName: file.originalname,
                    size: file.size,
                    mimetype: file.mimetype,
                },
            };
        } catch (error) {
            this.logger.error('Unexpected error during file upload:', error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
            };
        }
    }

    async downloadFile(fileKey: string): Promise<{
        success: boolean;
        data?: ArrayBuffer;
        error?: string;
    }> {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .download(fileKey);

            if (error) {
                this.logger.error(
                    'Error downloading file from Supabase:',
                    error
                );
                return {
                    success: false,
                    error: error.message,
                };
            }

            const arrayBuffer = await data.arrayBuffer();

            this.logger.log(`File downloaded successfully: ${fileKey}`);
            return {
                success: true,
                data: arrayBuffer,
            };
        } catch (error) {
            this.logger.error('Unexpected error during file download:', error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
            };
        }
    }

    async getSignedUrl(
        fileKey: string,
        expiresIn: number = 3600
    ): Promise<{
        success: boolean;
        data?: string;
        error?: string;
    }> {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .createSignedUrl(fileKey, expiresIn);

            if (error) {
                this.logger.error('Error creating signed URL:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            this.logger.log(`Signed URL created successfully for: ${fileKey}`);
            return {
                success: true,
                data: data.signedUrl,
            };
        } catch (error) {
            this.logger.error(
                'Unexpected error during signed URL creation:',
                error
            );
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
            };
        }
    }

    async deleteFile(fileKey: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove([fileKey]);

            if (error) {
                this.logger.error('Error deleting file from Supabase:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            this.logger.log(`File deleted successfully: ${fileKey}`);
            return {
                success: true,
            };
        } catch (error) {
            this.logger.error('Unexpected error during file deletion:', error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
            };
        }
    }

    async listFiles(folder?: string): Promise<{
        success: boolean;
        data?: any[];
        error?: string;
    }> {
        try {
            const path = folder || this.storageFolder;

            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .list(path);

            if (error) {
                this.logger.error('Error listing files from Supabase:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            this.logger.log(`Files listed successfully from: ${path}`);
            return {
                success: true,
                data,
            };
        } catch (error) {
            this.logger.error('Unexpected error during file listing:', error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
            };
        }
    }

    async getPublicUrl(fileKey: string): Promise<{
        success: boolean;
        data?: string;
        error?: string;
    }> {
        try {
            const { data } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileKey);

            this.logger.log(`Public URL retrieved for: ${fileKey}`);
            return {
                success: true,
                data: data.publicUrl,
            };
        } catch (error) {
            this.logger.error(
                'Unexpected error during public URL retrieval:',
                error
            );
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
            };
        }
    }
}
