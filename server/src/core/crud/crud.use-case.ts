import { Model } from 'mongoose';
import {
    Body,
    Req,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { ICrudQuery } from './crud-query.decorator';
import { defaultPaginate } from './crud-config';
import { get } from 'lodash';
import { CrudOptionsWithModel, PaginateKeys } from './crud.interface';
import { ResponsePresentationMapper } from 'src/presentation/mappers';

export class CrudPlaceholderDto {
    fake?: string;
    [key: string]: any;
}

export class CrudUseCase {
    constructor(
        public model: Model<{} | any>,
        public crudOptions?: CrudOptionsWithModel
    ) {}

    private validateObjectId(id: string): void {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestException('Invalid ObjectId format');
        }
    }

    async config(@Req() req) {
        if (!this.crudOptions) {
            return {};
        }
        const { config } = this.crudOptions;
        if (typeof config === 'function') {
            return config.call(this, req);
        }
        return config;
    }

    find(query: ICrudQuery = {}) {
        const where = JSON.parse(query.where ?? '{}');
        const populate = query.populate ?? undefined;
        const sort = query.sort ? JSON.parse(query.sort) : {};
        const collation = query.collation ?? undefined;
        const limit = query.limit ?? 10;
        const page = query.page ?? 1;
        let skip = query.skip ?? 0;

        if (skip < 1) {
            skip = (page - 1) * limit;
        }

        const paginateKeys: PaginateKeys | false = get(
            this.crudOptions,
            'routes.find.paginate',
            defaultPaginate
        );

        const find = async () => {
            const data = await this.model
                .find()
                .sort(sort)
                .limit(limit)
                .where(where)
                .skip(skip)
                .populate(populate)
                .collation(collation || { locale: 'en' });
            let result = data;
            const mapper = get(this.crudOptions, 'mapper');
            if (mapper) {
                result = data.map(mapper);
            }
            if (paginateKeys !== false) {
                const total = await this.model.countDocuments(where);
                return ResponsePresentationMapper.toPaginationResponse(
                    result,
                    total
                );
            }
            return result;
        };
        return find();
    }

    async findOne(id: string, query: ICrudQuery = {}) {
        this.validateObjectId(id);

        const where = JSON.parse(query.where ?? '{}');
        const populate = query.populate ?? undefined;
        const select = query.select ?? null;
        const data = await this.model
            .findById(id)
            .populate(populate)
            .select(select)
            .where(where);

        if (!data) {
            throw new NotFoundException('Record not found');
        }

        const mapper = get(this.crudOptions, 'mapper');
        let result = data;
        if (mapper) {
            result = mapper(data);
        }
        return ResponsePresentationMapper.toResponse(result);
    }

    async findOneByField(
        field: string,
        value: string | number,
        query: ICrudQuery = {}
    ) {
        const where = JSON.parse(query.where ?? '{}');
        const populate = query.populate ?? undefined;
        const select = query.select ?? null;
        const data = await this.model
            .findOne({ [field]: value })
            .populate(populate)
            .select(select)
            .where(where);
        const mapper = get(this.crudOptions, 'mapper');
        let result = data;
        if (mapper) {
            result = mapper(data);
        }
        return ResponsePresentationMapper.toResponse(result);
    }

    async create(body: any) {
        const transform = get(this.crudOptions, 'routes.create.transform');
        if (transform) {
            body = transform(body);
        }
        const data = await this.model.create(body);
        const mapper = get(this.crudOptions, 'mapper');
        let result = data;
        if (mapper) {
            result = mapper(data);
        }
        this.afterCreate(result);
        return ResponsePresentationMapper.toResponse(result);
    }

    async afterCreate(result: any) {}

    async update(id: string, @Body() body: any) {
        this.validateObjectId(id);

        // Check if document exists first
        const existingDoc = await this.model.findById(id);
        if (!existingDoc) {
            throw new NotFoundException('Record not found');
        }

        const transform = get(this.crudOptions, 'routes.update.transform');
        if (transform) {
            body = transform(body);
        }

        // Automatically update the updatedAt field
        body.updatedAt = new Date();

        const data = await this.model.findOneAndUpdate({ _id: id }, body, {
            new: true,
            upsert: false,
            runValidators: true,
        });
        let result = data;
        const mapper = get(this.crudOptions, 'mapper');
        if (mapper) {
            result = mapper(data);
        }
        this.afterUpdate(result);
        return ResponsePresentationMapper.toResponse(result);
    }

    async afterUpdate(result: any) {}

    async delete(id: string) {
        this.validateObjectId(id);

        const data = await this.model.findOneAndRemove({ _id: id });
        if (!data) {
            throw new NotFoundException('Record not found');
        }
        this.afterDelete(data);
        return ResponsePresentationMapper.toResponse({ id });
    }

    async afterDelete(result: any) {}
}
