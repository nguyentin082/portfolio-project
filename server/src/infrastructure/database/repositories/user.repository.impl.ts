import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from 'src/core/repositories/user.repository';
import { User } from '../../../core/entities/user.entity';
import { UserDocument } from '../entities/user.schema';
import { UserMapper } from '../mappers/user.mapper';
import { BaseRepositoryImpl } from './base.repository.impl';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
    repository: BaseRepositoryImpl<UserDocument>;
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>
    ) {
        this.repository = new BaseRepositoryImpl(this.userModel);
    }

    async findAllPaginated({
        page,
        limit,
        sort = 'model',
        order = 'asc' as 'asc' | 'desc',
        filter,
    }) {
        const { data, total } = await this.repository.findAllPaginated<User>({
            page,
            limit,
            sort,
            order,
            filter,
        });
        return {
            data: data.map(UserMapper.toDomain),
            total,
        };
    }

    async findById(id: string): Promise<User | null> {
        const doc = await this.repository.findById(id);
        return doc ? UserMapper.toDomain(doc) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const doc = await this.repository.findOne({ email });
        return doc ? UserMapper.toDomain(doc) : null;
    }

    async save(user: User): Promise<User> {
        const doc = await this.repository.create(
            UserMapper.toPersistence(user)
        );
        return UserMapper.toDomain(doc);
    }

    getModel(): Model<any> {
        return this.userModel;
    }
}
