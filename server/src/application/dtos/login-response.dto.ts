import { User } from '../../core/entities/user.entity';

export class LoginResponseDto {
    user: User;
    token: string;

    constructor(user: User, token: string) {
        this.user = user;
        this.token = token;
    }
}
