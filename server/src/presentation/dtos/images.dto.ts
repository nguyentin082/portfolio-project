import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Images } from 'src/core/entities/images.entity';
import { ImageStatusEnum } from 'src/core/enums/images.enum';

export class CreateImagesDto implements Omit<Images, 'id'> {
    @ApiProperty({
        description: 'User ID of the image owner',
        example: '123',
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'File key for the image',
        example: 'testfilekey',
    })
    @IsNotEmpty()
    @IsString()
    fileKey: string;

    @ApiProperty({
        description: 'Name of the image',
        example: 'Sample Image',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Playground ID associated with the image',
        example: 'playground_123',
    })
    @IsNotEmpty()
    @IsString()
    playgroundId: string;

    @ApiProperty({
        description: 'Status of the image',
        enum: ImageStatusEnum,
        example: ImageStatusEnum.UPLOADED,
    })
    @IsNotEmpty()
    @IsEnum(ImageStatusEnum)
    status: ImageStatusEnum;

    faces: any; // Replace 'any' with the correct type if known

    createdAt: Date;
    updatedAt: Date;
}
