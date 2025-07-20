import { Model } from 'mongoose';
import { Persons } from 'src/core/entities/persons.entity';

export abstract class PersonsRepository {
    abstract findAllPaginated(params: {
        page: number;
        limit: number;
        sort?: string;
        order?: 'asc' | 'desc';
        filter?: Record<string, any>;
    }): Promise<{ data: Persons[]; total: number }>;
    abstract findById(id: string): Promise<Persons | null>;
    abstract create(Persons: Omit<Persons, 'id'>): Promise<Persons>;
    abstract update(
        id: string,
        Persons: Partial<Omit<Persons, 'id'>>
    ): Promise<Persons | null>;
    abstract delete(id: string): Promise<boolean>;
    abstract getModel(): Model<Persons>;
}
