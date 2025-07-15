import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImagesRepository } from 'src/core/repositories/images.repository';
import { Images } from 'src/core/entities/images.entity';
import { ImagesDocument } from '../entities/images.schema';
import { ImagesMapper } from '../mappers/images.mapper';
import { BaseRepositoryImpl } from './base.repository.impl';

@Injectable()
export class ImagesRepositoryImpl implements ImagesRepository {
    repository: BaseRepositoryImpl<ImagesDocument>;
    constructor(
        @InjectModel('Images')
        private readonly model: Model<ImagesDocument>
    ) {
        this.repository = new BaseRepositoryImpl(this.model);
    }

    async findAllPaginated({
        page,
        limit,
        sort = 'createdAt',
        order = 'desc' as 'asc' | 'desc',
        filter,
    }) {
        const { data, total } = await this.repository.findAllPaginated<Images>({
            page,
            limit,
            sort,
            order,
            filter,
        });
        return {
            data: data.map((doc) => {
                const mappedDoc = ImagesMapper.toDomain(doc);
                // Ensure we never return null in the array to match the interface
                return mappedDoc || new Images(); // Return empty doc instead of null
            }),
            total,
        };
    }
    async findById(id: string) {
        const doc = await this.repository.findById(id);
        return doc ? ImagesMapper.toDomain(doc) : null;
    }

    async findByUserId(userId: string) {
        const docs = await this.model.find({ userId }).exec();

        // Filter out any null values that might come from the mapper
        return docs.map((doc) => {
            const mappedDoc = ImagesMapper.toDomain(doc);
            return mappedDoc;
        });
    }

    async create(Images: Omit<Images, 'id'>) {
        const doc = await this.repository.create(Images);
        const mappedDoc = ImagesMapper.toDomain(doc);

        if (!mappedDoc) {
            throw new Error('Failed to create Images - mapping returned null');
        }

        return mappedDoc;
    }

    async update(id: string, Images: Partial<Omit<Images, 'id'>>) {
        const updated = await this.repository.update(
            id,
            ImagesMapper.toPersistence(Images as any)
        );
        return updated ? ImagesMapper.toDomain(updated) : null;
    }

    async delete(id: string) {
        const deleted = await this.repository.delete(id);
        return deleted;
    }

    getModel(): Model<any> {
        return this.model;
    }
}
