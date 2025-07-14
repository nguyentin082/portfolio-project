import { User } from 'src/core/entities/user.entity';

export class UserPresentationMapper {
    static toResponse(user: User) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            channel: user.channel ?? '',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static toProfileResponse(user: User) {
        return {
            success: true,
            data: this.toResponse(user),
        };
    }
}
