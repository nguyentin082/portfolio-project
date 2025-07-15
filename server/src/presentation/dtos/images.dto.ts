import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Images } from 'src/core/entities/images.entity';

export class CreateImagesDto implements Omit<Images, 'id'> {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    fileKey: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    playgroundId: string;

    faces: any; // Replace 'any' with the correct type if known

    createdAt: Date;
    updatedAt: Date;
}
