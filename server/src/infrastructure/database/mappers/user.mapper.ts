import { User } from '../../../core/entities/user.entity';
import { UserDocument } from '../entities/user.schema';

export class UserMapper {
    static toDomain(doc: UserDocument): User {
        return new User(
            doc._id.toString(),
            doc.email,
            doc.password,
            doc.firstName,
            doc.lastName,
            '', // channel
            doc.createdAt,
            doc.updatedAt
        );
    }

    static toPersistence(user: User): any {
        return {
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
        };
    }
}
