import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FaceDto {
    @ApiProperty({
        description: 'Vector ID in Milvus database',
        example: 'vector_123',
        required: false,
    })
    @IsOptional()
    @IsString()
    milvusId?: string;

    @ApiProperty({
        description: 'Bounding box coordinates [x, y, width, height]',
        type: [Number],
        example: [100, 100, 50, 50],
        required: false,
    })
    @IsOptional()
    @IsArray()
    bbox?: number[];

    @ApiProperty({
        description: 'Person ID',
        example: 'person_123',
        required: false,
    })
    @IsOptional()
    @IsString()
    personId?: string;

    @ApiProperty({
        description: 'Name of the person',
        example: 'John Doe',
        required: false,
    })
    @IsOptional()
    @IsString()
    personName?: string;
}

export class UpdateImagesDto {
    @ApiProperty({
        description: 'File key used to identify the document in storage',
        required: false,
        default: 'testFileKey',
    })
    @IsString()
    @IsOptional()
    fileKey?: string;

    @ApiProperty({
        description: 'Faces detected in the image',
        type: [FaceDto],
        required: false,
        default: [],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FaceDto)
    faces?: FaceDto[];
}

export class CreateImagesDto {
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
        type: [FaceDto],
        required: false,
        default: [],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FaceDto)
    faces?: FaceDto[];

    createdAt: Date;
    updatedAt: Date;
}
