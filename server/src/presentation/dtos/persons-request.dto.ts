import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
    @ApiProperty({
        description: 'Name of the person',
        example: 'Donald Trump',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    // userId will be automatically extracted from JWT token
}

export class UpdatePersonDto {
    @ApiProperty({
        description: 'Name of the person',
        example: 'Donald J. Trump',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;
}
