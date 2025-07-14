import { Model } from 'mongoose';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
    abstract findAllPaginated(params: {
        page: number;
        limit: number;
        sort?: string;
        order?: 'asc' | 'desc';
        filter?: Record<string, any>;
    }): Promise<{ data: User[]; total: number }>;
    abstract findById(id: string): Promise<User | null>;
    abstract findByEmail(email: string): Promise<User | null>;
    abstract save(user: User): Promise<User>;
    abstract getModel(): Model<User>;
}
