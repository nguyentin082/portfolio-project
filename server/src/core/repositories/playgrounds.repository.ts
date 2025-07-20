import { Model } from 'mongoose';
import { Playgrounds } from 'src/core/entities/playgrounds.entity';

export abstract class PlaygroundsRepository {
    abstract findAllPaginated(params: {
        page: number;
        limit: number;
        sort?: string;
        order?: 'asc' | 'desc';
        filter?: Record<string, any>;
    }): Promise<{ data: Playgrounds[]; total: number }>;
    abstract findById(id: string): Promise<Playgrounds | null>;
    abstract create(Playgrounds: Omit<Playgrounds, 'id'>): Promise<Playgrounds>;
    abstract update(
        id: string,
        Playgrounds: Partial<Omit<Playgrounds, 'id'>>
    ): Promise<Playgrounds | null>;
    abstract delete(id: string): Promise<boolean>;
    abstract getModel(): Model<Playgrounds>;
}
