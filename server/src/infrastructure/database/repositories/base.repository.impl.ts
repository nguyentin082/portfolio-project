import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class BaseRepositoryImpl<A> {
  model: Model<A>;

  constructor(model: Model<A>) {
    this.model = model;
  }

  async findAllPaginated<T>({
    page,
    limit,
    sort = 'createdAt',
    order = 'desc',
    filter,
  }: {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filter?: Record<string, any>;
  }): Promise<{ data: A[]; total: number }> {
    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = {
      [sort]: order === 'asc' ? 1 : -1,
    };
    const [data, total] = await Promise.all([
      this.model
        .find(filter || {})
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter || {}).exec(),
    ]);
    return {
      data,
      total,
    };
  }

  async findById<T>(id: string): Promise<A | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? doc : null;
  }

  async findOne<T>(filter: Record<string, any>): Promise<A | null> {
    const doc = await this.model.findOne(filter).exec();
    return doc ? doc : null;
  }

  async create<T>(input: Omit<T, 'id'>): Promise<A> {
    const created = await this.model.create(input);
    return created;
  }

  async update<T>(
    id: string,
    input: Partial<Omit<T, 'id'>>,
  ): Promise<A | null> {
    const updated = await this.model
      .findByIdAndUpdate(id, { $set: input as any }, { new: true })
      .exec();
    return updated ? updated : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id).exec();
    return !!res;
  }

  getModel(): Model<any> {
    return this.model;
  }
}
