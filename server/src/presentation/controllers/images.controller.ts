import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';

import {
    ApiTags,
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import {
    CreateImagesDto,
    UpdateImagesDto,
} from 'src/presentation/dtos/images-request.dto';

import { ImagesCrudUseCase } from 'src/application/use-cases/images/images-crud.use-case';
import { ICrudQuery } from 'src/core/crud/crud-query.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';

@ApiTags('Images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('images')
export class ImagesController {
    constructor(private readonly crud: ImagesCrudUseCase) {}

    // Endpoint to get API config
    @Get('config')
    @ApiOperation({ summary: 'API Config', operationId: 'config' })
    async config(@Req() req) {
        return this.crud.config(req);
    }

    // Endpoint to get all images
    @Get()
    @ApiQuery({
        name: 'where',
        description: 'Filter for the query',
        required: false,
        type: String,
        example: '{"userId": { "$in": "123456" }}',
    })
    @ApiOperation({
        summary: 'Find all records (having filter)',
        operationId: 'list',
    })
    async find(@Query() query: ICrudQuery = {}) {
        return await this.crud.find(query);
    }

    // Endpoint to get images by ID
    @Get(':id')
    @ApiParam({
        name: 'id',
        description: 'Image record ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({ summary: 'Find a record' })
    async findOne(@Param('id') id: string, @Query() query: ICrudQuery = {}) {
        return await this.crud.findOne(id, query);
    }

    // Endpoint to create a new image record
    @Post()
    @ApiOperation({ summary: 'Create a image' })
    async create(@Body() body: CreateImagesDto) {
        return this.crud.create({ ...body });
    }

    // Endpoint to update an existing image record
    @Put(':id')
    @ApiParam({
        name: 'id',
        description: 'Image ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({ summary: 'Update a image' })
    async update(@Param('id') id: string, @Body() body: UpdateImagesDto) {
        return await this.crud.update(id, body);
    }

    //Endpoint to delete a image record
    @Delete(':id')
    @ApiParam({
        name: 'id',
        description: 'Image ID',
        required: true,
        example: '682c2f50f2dea031d250deb5',
    })
    @ApiOperation({ summary: 'Delete a image record' })
    async delete(@Param('id') id: string) {
        return await this.crud.delete(id);
    }
}
