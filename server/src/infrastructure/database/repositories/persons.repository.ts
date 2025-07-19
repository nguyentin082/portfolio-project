import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersonsRepository } from 'src/core/repositories/persons';
import { Persons } from 'src/core/entities/persons.entity';
import { PersonsDocument } from '../entities/persons';
import { PersonsMapper } from '../mappers/persons.mapper';

@Injectable()
export class PersonsRepositoryImpl implements PersonsRepository {
    constructor(
        @InjectModel('Persons')
        private readonly personsModel: Model<PersonsDocument>
    ) {}

    async findAllPaginated(params: {
        page: number;
        limit: number;
        sort?: string;
        order?: 'asc' | 'desc';
        filter?: Record<string, any>;
    }): Promise<{ data: Persons[]; total: number }> {
        const { page, limit, sort, order, filter } = params;
        const skip = (page - 1) * limit;

        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj: any = sort ? { [sort]: sortOrder } : { createdAt: -1 };

        const [data, total] = await Promise.all([
            this.personsModel
                .find(filter || {})
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.personsModel.countDocuments(filter || {}).exec(),
        ]);

        return {
            data: data
                .map((doc) => PersonsMapper.toDomain(doc))
                .filter(Boolean) as Persons[],
            total,
        };
    }

    async findById(id: string): Promise<Persons | null> {
        const doc = await this.personsModel.findById(id).exec();
        return doc ? PersonsMapper.toDomain(doc) : null;
    }

    async create(personData: Omit<Persons, 'id'>): Promise<Persons> {
        const persistenceData = PersonsMapper.toPersistence(
            personData as Persons
        );
        const doc = new this.personsModel(persistenceData);
        const savedDoc = await doc.save();
        return PersonsMapper.toDomain(savedDoc) as Persons;
    }

    async update(
        id: string,
        personData: Partial<Omit<Persons, 'id'>>
    ): Promise<Persons | null> {
        const updateData = PersonsMapper.toPersistence(personData as Persons);
        updateData.updatedAt = new Date();

        const doc = await this.personsModel
            .findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
            })
            .exec();

        return doc ? PersonsMapper.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.personsModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    getModel(): Model<any> {
        return this.personsModel;
    }
}
