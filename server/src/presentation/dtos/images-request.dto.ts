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
        description: 'Milvus ID - unique identifier for face embedding',
        example: 'c0a999e3-cda3-428c-b57e-aa6bd5883b5b',
        required: false,
    })
    @IsOptional()
    @IsString()
    milvusId?: string;

    @ApiProperty({
        description: 'Bounding box coordinates [x1, y1, x2, y2]',
        type: [Number],
        example: [722.35, 260.24, 1260.34, 940.3],
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
}

export class UpdateFaceDto {
    @ApiProperty({
        description: 'Person ID',
        example: 'person_123',
        required: false,
    })
    @IsOptional()
    @IsString()
    personId?: string;

    @ApiProperty({
        description: 'Bounding box coordinates [x1, y1, x2, y2]',
        type: [Number],
        example: [722.35, 260.24, 1260.34, 940.3],
        required: false,
    })
    @IsOptional()
    @IsArray()
    bbox?: number[];

    @ApiProperty({
        description: 'Milvus ID for face embedding',
        example: 'c0a999e3-cda3-428c-b57e-aa6bd5883b5b',
        required: false,
    })
    @IsOptional()
    @IsString()
    milvusId?: string;
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
