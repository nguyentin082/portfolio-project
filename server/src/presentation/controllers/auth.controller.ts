import {
    Body,
    Controller,
    Post,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { LoginUserDto } from '../dtos/login-user.dto';
import { RegisterUserUseCase } from '../../application/use-cases/user/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/user/login-user.use-case';
import { AuthPresentationMapper } from '../mappers/auth.mapper';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() dto: RegisterUserDto) {
        try {
            const user = await this.registerUserUseCase.execute(
                dto.email,
                dto.password,
                dto.firstName,
                dto.lastName
            );
            return AuthPresentationMapper.toRegisterResponse(user);
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with credentials' })
    async login(@Body() dto: LoginUserDto) {
        try {
            const loginResponse = await this.loginUserUseCase.execute(
                dto.email,
                dto.password
            );
            return AuthPresentationMapper.toLoginResponse(
                loginResponse.user,
                loginResponse.token
            );
        } catch (e) {
            throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
        }
    }
}
