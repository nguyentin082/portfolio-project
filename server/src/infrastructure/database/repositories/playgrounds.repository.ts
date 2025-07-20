import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlaygroundsRepository } from 'src/core/repositories/playgrounds.repository';
import { Playgrounds } from 'src/core/entities/playgrounds.entity';
import {
    Playgrounds as PlaygroundsDocument,
    PlaygroundsDocument as PlaygroundsDocumentType,
} from '../entities/playgrounds.schema';
import { PlaygroundsMapper } from '../mappers/playgrounds.mapper';

@Injectable()
export class PlaygroundsRepositoryImpl extends PlaygroundsRepository {
    constructor(
        @InjectModel('Playgrounds')
        private readonly playgroundsModel: Model<PlaygroundsDocumentType>
    ) {
        super();
    }

    async findAllPaginated(params: {
        page: number;
        limit: number;
        sort?: string;
        order?: 'asc' | 'desc';
        filter?: Record<string, any>;
    }): Promise<{ data: Playgrounds[]; total: number }> {
        const {
            page,
            limit,
            sort = 'createdAt',
            order = 'desc',
            filter = {},
        } = params;
        const skip = (page - 1) * limit;

        const sortOrder = order === 'asc' ? 1 : -1;

        const [data, total] = await Promise.all([
            this.playgroundsModel
                .find(filter)
                .sort({ [sort]: sortOrder } as any)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.playgroundsModel.countDocuments(filter).exec(),
        ]);

        return {
            data: data
                .map((doc) => PlaygroundsMapper.toDomain(doc))
                .filter(Boolean) as Playgrounds[],
            total,
        };
    }

    async findById(id: string): Promise<Playgrounds | null> {
        const doc = await this.playgroundsModel.findById(id).exec();
        return doc ? PlaygroundsMapper.toDomain(doc) : null;
    }

    async create(playgrounds: Omit<Playgrounds, 'id'>): Promise<Playgrounds> {
        const doc = new this.playgroundsModel(playgrounds);
        const saved = await doc.save();
        return PlaygroundsMapper.toDomain(saved)!;
    }

    async update(
        id: string,
        playgrounds: Partial<Omit<Playgrounds, 'id'>>
    ): Promise<Playgrounds | null> {
        const updated = await this.playgroundsModel
            .findByIdAndUpdate(
                id,
                { ...playgrounds, updatedAt: new Date() },
                { new: true }
            )
            .exec();
        return updated ? PlaygroundsMapper.toDomain(updated) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.playgroundsModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    getModel(): Model<Playgrounds> {
        return this.playgroundsModel as any;
    }
}
