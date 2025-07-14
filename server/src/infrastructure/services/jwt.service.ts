import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
    constructor(private readonly jwtService: NestJwtService) {}

    generateToken(userId: string): string {
        return this.jwtService.sign({
            sub: userId,
            userId: userId,
        });
    }

    verifyToken(token: string): any {
        return this.jwtService.verify(token);
    }
}
