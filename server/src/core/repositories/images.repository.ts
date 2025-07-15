import { Model } from 'mongoose';
import { Images } from 'src/core/entities/images.entity';

export abstract class ImagesRepository {
    abstract findAllPaginated(params: {
        page: number;
        limit: number;
        sort?: string;
        order?: 'asc' | 'desc';
        filter?: Record<string, any>;
    }): Promise<{ data: Images[]; total: number }>;
    abstract findById(id: string): Promise<Images | null>;
    abstract create(Images: Omit<Images, 'id'>): Promise<Images>;
    abstract update(
        id: string,
        Images: Partial<Omit<Images, 'id'>>
    ): Promise<Images | null>;
    abstract delete(id: string): Promise<boolean>;
    abstract getModel(): Model<Images>;
}
