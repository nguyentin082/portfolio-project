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
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { ICrudQuery } from 'src/core/crud/crud-query.decorator';
import { PersonsCrudUseCase } from 'src/application/use-cases/persons/persons-crud.use-case';
import { User } from 'src/presentation/decorators/user.decorator';
import {
    CreatePersonDto,
    UpdatePersonDto,
} from 'src/presentation/dtos/persons-request.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('persons')
@ApiTags('Persons')
export class PersonsController {
    constructor(private readonly crud: PersonsCrudUseCase) {}

    @Get('config')
    @ApiOperation({ summary: 'API Config', operationId: 'config' })
    async config(@User() user: any) {
        return this.crud.config({ user });
    }

    @Get()
    @ApiOperation({
        summary: 'Find all persons',
        description: 'Get all persons for the authenticated user',
        operationId: 'list',
    })
    @ApiQuery({
        name: 'where',
        description: 'Filter for the query',
        required: false,
        type: String,
        example: '{"name": {"$regex": "Trump", "$options": "i"}}',
    })
    @ApiQuery({
        name: 'page',
        description: 'Page number',
        required: false,
        type: Number,
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        description: 'Items per page',
        required: false,
        type: Number,
        example: 10,
    })
    async find(@Query() query: ICrudQuery = {}, @User('id') userId: string) {
        const result = await this.crud.find(query);
        return result;
    }

    @Get(':id')
    @ApiParam({
        name: 'id',
        description: 'Person ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({
        summary: 'Find a person',
        description: 'Get a specific person by ID',
    })
    async findOne(@Param('id') id: string, @Query() query: ICrudQuery = {}) {
        return this.crud.findOne(id, query);
    }

    @Post()
    @ApiOperation({
        summary: 'Create a person',
        description: 'Create a new person entry',
    })
    @ApiBody({
        type: CreatePersonDto,
        description: 'Person creation data',
        examples: {
            example1: {
                summary: 'Create person',
                value: {
                    name: 'Donald Trump',
                },
            },
        },
    })
    async create(@Body() body: CreatePersonDto, @User('id') userId: string) {
        const personData = {
            ...body,
            userId,
        };
        return this.crud.create(personData);
    }

    @Put(':id')
    @ApiParam({
        name: 'id',
        description: 'Person ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({
        summary: 'Update a person',
        description: 'Update an existing person entry',
    })
    @ApiBody({
        type: UpdatePersonDto,
        description: 'Person update data',
        examples: {
            example1: {
                summary: 'Update person name',
                value: {
                    name: 'Donald J. Trump',
                },
            },
        },
    })
    async update(@Param('id') id: string, @Body() body: UpdatePersonDto) {
        return this.crud.update(id, body);
    }

    @Delete(':id')
    @ApiParam({
        name: 'id',
        description: 'Person ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({
        summary: 'Delete a person',
        description: 'Delete a person entry',
    })
    async delete(@Param('id') id: string) {
        return this.crud.delete(id);
    }
}
