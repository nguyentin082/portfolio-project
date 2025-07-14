import { UserRepository } from 'src/core/repositories/user.repository';
import * as bcrypt from 'bcryptjs';
import { Inject } from '@nestjs/common';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { LoginResponseDto } from 'src/application/dtos/login-response.dto';

export class LoginUserUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService
    ) {}

    async execute(email: string, password: string): Promise<LoginResponseDto> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new Error('Invalid credentials');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        const token = this.jwtService.generateToken(user.id);
        return new LoginResponseDto(user, token);
    }
}
