import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateImagesDto {
    @ApiProperty({
        description: 'User ID associated with the document',
        required: false,
        default: 'testUserId',
    })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiProperty({
        description: 'File key used to identify the document in storage',
        required: false,
        default: 'testFileKey',
    })
    @IsString()
    @IsOptional()
    fileKey?: string;

    @ApiProperty({
        description: 'Name of the document',
        required: false,
        default: 'testName',
    })
    @IsString()
    @IsOptional()
    name?: string;
}

export class CreateImagesDto {
    @ApiProperty({
        description: 'User ID associated with the document',
        example: 'testUserId',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'File key used to identify the document in storage',
        example: 'testFileKey',
    })
    @IsNotEmpty()
    @IsString()
    fileKey: string;

    @ApiProperty({
        description: 'Playground ID associated with the document',
        example: 'testPlaygroundId',
    })
    @IsNotEmpty()
    @IsString()
    playgroundId: string;

    @ApiProperty({
        description: 'Faces detected in the image',
        type: [Object],
        required: false,
        default: [],
    })
    @IsOptional()
    faces?: {
        bbox: number[];
        name: string;
        vectorId: string;
        personId: string;
    }[];

    createdAt: Date;
    updatedAt: Date;
}
