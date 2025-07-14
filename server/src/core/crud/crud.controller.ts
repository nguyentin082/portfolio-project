import { Model } from 'mongoose';
import {
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ICrudQuery } from './crud-query.decorator';
import { defaultPaginate } from './crud-config';
import { get } from 'lodash';
import { CrudOptionsWithModel, PaginateKeys } from './crud.interface';
import { ResponsePresentationMapper } from 'src/presentation/mappers';

export class CrudPlaceholderDto {
  fake?: string;
  [key: string]: any;
}

export class CrudController {
  constructor(
    public model: Model<{} | any>,
    public crudOptions?: CrudOptionsWithModel,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'API Config', operationId: 'config' })
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

  @Get()
  @ApiOperation({ summary: 'Find all records', operationId: 'list' })
  @ApiQuery({
    name: 'query',
    type: String,
    required: false,
    description: 'Query options',
  })
  find(@Query() query: ICrudQuery = {}) {
    const where = JSON.parse(query.where ?? '{}');
    const populate = query.populate ?? undefined;
    const sort = query.sort ?? undefined;
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
      defaultPaginate,
    );

    const find = async () => {
      const data = await this.model
        .find()
        .where(where)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .populate(populate)
        .collation(collation || { locale: 'en' });
      let result = data;
      const mapper = get(this.crudOptions, 'mapper');
      if (mapper) {
        result = data.map(mapper);
      }
      if (paginateKeys !== false) {
        const total = await this.model.countDocuments(where);
        return ResponsePresentationMapper.toPaginationResponse(result, total);
      }
      return result;
    };
    return find();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a record' })
  async findOne(@Param('id') id: string, @Query() query: ICrudQuery = {}) {
    const where = JSON.parse(query.where ?? '{}');
    const populate = query.populate ?? undefined;
    const select = query.select ?? null;
    const data = await this.model
      .findById(id)
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

  @Post()
  @ApiOperation({ summary: 'Create a record' })
  async create(@Body() body: CrudPlaceholderDto) {
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
    return ResponsePresentationMapper.toResponse(result);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a record' })
  async update(@Param('id') id: string, @Body() body: CrudPlaceholderDto) {
    const transform = get(this.crudOptions, 'routes.update.transform');
    if (transform) {
      body = transform(body);
    }
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
    return ResponsePresentationMapper.toResponse(result);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a record' })
  async delete(@Param('id') id: string) {
    const data = await this.model.findOneAndRemove({ _id: id });
    if (!data) {
      throw new BadRequestException('Record not found');
    }
    return ResponsePresentationMapper.toResponse({ id });
  }
}
