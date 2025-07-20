import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaygroundDto {
    @ApiProperty({
        description: 'Domain ID of the playground',
        example: 'domain-123',
    })
    @IsNotEmpty()
    @IsString()
    domainName: string;

    @ApiProperty({
        description: 'Name of the playground',
        example: 'My Playground',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    // userId will be automatically extracted from JWT token
}

export class UpdatePlaygroundDto {
    @ApiProperty({
        description: 'Name of the playground',
        example: 'My Updated Playground',
        required: false,
    })
    @IsString()
    name: string;

    // userId will be automatically extracted from JWT token
}
