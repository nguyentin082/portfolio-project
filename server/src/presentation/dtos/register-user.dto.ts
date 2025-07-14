import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
    @ApiProperty({
        description: 'Email of the user',
        example: 'test@gmail.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password of the user',
        example: '123456',
    })
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        description: 'First name of the user',
        example: 'Test',
    })
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'User',
    })
    @IsNotEmpty()
    lastName: string;
}
