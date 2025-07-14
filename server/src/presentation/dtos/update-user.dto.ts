import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
    })
    lastName: string;
}
