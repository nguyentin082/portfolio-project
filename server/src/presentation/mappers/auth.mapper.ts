import { User } from '../../core/entities/user.entity';

export class AuthPresentationMapper {
    static toRegisterResponse(user: User) {
        return {
            success: true,
            data: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }

    static toLoginResponse(user: User, token: string) {
        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token,
            },
        };
    }
}
