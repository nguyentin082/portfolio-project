import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({ example: 'nguyentin082@gmail.com' })
    @IsEmail()
    @Transform(({ value }) => value ?? 'nguyentin082@gmail.com')
    email: string;

    @ApiProperty({ example: '123456' })
    @MinLength(6)
    @Transform(({ value }) => value ?? '123456')
    password: string;
}
