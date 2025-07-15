import {
    Controller,
    Get,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiBearerAuth,
    ApiQuery,
    ApiOperation,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { ResponsePresentationMapper } from 'src/presentation/mappers/response.mapper';
import { GeneratePresignedUrlUseCase } from 'src/application/use-cases/upload/get-file-presigned-url.use-case';
import { UploadImageUseCase } from 'src/application/use-cases/upload/upload-image.use-case';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Upload')
@Controller('upload')
export class UploadController {
    constructor(
        private readonly generatePresignedUrl: GeneratePresignedUrlUseCase,
        private readonly uploadImageUseCase: UploadImageUseCase
    ) {}

    // Endpoint for direct image upload with Supabase
    @Post('image')
    @ApiOperation({
        summary: 'Direct image upload to Supabase storage',
        description:
            'Upload an image directly to Supabase storage and get the public URL',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (JPEG, PNG, GIF, WebP)',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        const result = await this.uploadImageUseCase.execute(file);

        return ResponsePresentationMapper.toResponse({
            fileKey: result.fileKey,
            publicUrl: result.publicUrl,
            originalName: result.originalName,
        });
    }

    // Endpoint to get presigned URL for downloading images that are already uploaded
    @Get()
    @ApiOperation({
        summary: 'Get presigned URL for downloading uploaded images',
        description:
            'Generate a presigned URL to securely download images that are already uploaded',
    })
    @ApiQuery({
        name: 'fileKey',
        required: true,
        description: 'The key of the image file to download',
        type: 'string',
        example: 'face-recognition/uuid-filename.jpg',
    })
    @ApiQuery({
        name: 'expiresIn',
        required: false,
        description:
            'Expiration time in seconds for the presigned URL (default: 7 days)',
        type: 'number',
        example: 3600,
    })
    async getPresignedUrl(
        @Query('fileKey') fileKey: string,
        @Query('expiresIn') expiresIn?: number
    ) {
        const result = await this.generatePresignedUrl.execute({
            fileKey: fileKey,
            expiresIn: expiresIn,
        });
        return ResponsePresentationMapper.toResponse(result);
    }
}
