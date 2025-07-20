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
import { PlaygroundsCrudUseCase } from 'src/application/use-cases/playgrounds/playgrounds-crud.use-case';
import { User } from 'src/presentation/decorators/user.decorator';
import {
    CreatePlaygroundDto,
    UpdatePlaygroundDto,
} from 'src/presentation/dtos/playgrounds-request.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('playgrounds')
@ApiTags('Playgrounds')
export class PlaygroundsController {
    constructor(private readonly crud: PlaygroundsCrudUseCase) {}

    @Get('config')
    @ApiOperation({ summary: 'API Config', operationId: 'config' })
    async config(@User() user: any) {
        return this.crud.config({ user });
    }

    // List all playgrounds for the authenticated user
    @Get()
    @ApiOperation({
        summary: 'Find all playgrounds',
        description: 'Get all playgrounds owned by the authenticated user',
        operationId: 'list',
    })
    @ApiQuery({
        name: 'where',
        description:
            'Additional filter for the query (will be combined with userId filter)',
        required: false,
        type: String,
        example: '{"name": {"$regex": "Face", "$options": "i"}}',
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
        // Filter playgrounds by userId
        const userFilter = { userId };

        // If there's already a where filter, merge it with userId filter
        const whereFilter = query.where
            ? { ...JSON.parse(query.where as string), ...userFilter }
            : userFilter;

        const filteredQuery = {
            ...query,
            where: JSON.stringify(whereFilter),
        };

        const result = await this.crud.find(filteredQuery);
        return result;
    }

    @Get(':id')
    @ApiParam({
        name: 'id',
        description: 'Playground ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({
        summary: 'Find a playground',
        description: 'Get a specific playground by ID',
    })
    async findOne(@Param('id') id: string, @Query() query: ICrudQuery = {}) {
        return this.crud.findOne(id, query);
    }

    @Post()
    @ApiOperation({
        summary: 'Create a playground',
        description: 'Create a new playground entry',
    })
    @ApiBody({
        type: CreatePlaygroundDto,
        description: 'Playground creation data',
        examples: {
            example1: {
                summary: 'Create playground',
                value: {
                    name: 'Central Park',
                },
            },
        },
    })
    async create(
        @Body() body: CreatePlaygroundDto,
        @User('id') userId: string
    ) {
        const playgroundData = {
            ...body,
            userId,
        };
        return this.crud.create(playgroundData);
    }

    @Put(':id')
    @ApiParam({
        name: 'id',
        description: 'Playground ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({
        summary: 'Update a playground',
        description: 'Update an existing playground entry',
    })
    @ApiBody({
        type: UpdatePlaygroundDto,
    })
    async update(
        @Param('id') id: string,
        @Body() body: UpdatePlaygroundDto,
        @User('id') userId: string
    ) {
        const playgroundData = {
            ...body,
            userId,
        };
        return this.crud.update(id, playgroundData);
    }

    @Delete(':id')
    @ApiParam({
        name: 'id',
        description: 'Playground ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiOperation({
        summary: 'Delete a playground',
        description: 'Delete a playground entry',
    })
    async delete(@Param('id') id: string) {
        return this.crud.delete(id);
    }
}
