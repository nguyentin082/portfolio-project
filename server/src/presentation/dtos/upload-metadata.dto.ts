import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UploadMetadataDto {
    @ApiProperty({
        description: 'Name of the file to upload',
        example: 'document.pdf',
    })
    @IsString()
    fileName: string;

    @ApiProperty({
        description: 'Expiration time for the upload URL in seconds',
        example: 3600,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    expiresIn?: number;
}

export class FileKeyDto {
    @ApiProperty({
        description: 'Key of the file to download',
        example: 'portfolio-projects/uuid-filename.jpg',
    })
    @IsString()
    fileKey: string;

    @ApiProperty({
        description: 'Expiration time for the presigned URL in seconds',
        example: 3600,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    expiresIn?: number;
}
