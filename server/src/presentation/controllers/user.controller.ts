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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserCrudUseCase } from 'src/application/use-cases/user/user-crud.use-case';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { ICrudQuery } from 'src/core/crud/crud-query.decorator';
import { RegisterUserDto } from 'src/presentation/dtos/register-user.dto';
import { UpdateUserDto } from 'src/presentation/dtos/update-user.dto';
import { User } from 'src/presentation/decorators/user.decorator';
import { MyProfileUseCase } from 'src/application/use-cases/user/my-profile.use-case';
import { UserPresentationMapper } from 'src/presentation/mappers/user.mapper';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('users')
@ApiTags('Users')
export class UserController {
    constructor(
        private readonly crud: UserCrudUseCase,
        private readonly myProfileUseCase: MyProfileUseCase
    ) {}

    @Get('config')
    @ApiOperation({ summary: 'API Config', operationId: 'config' })
    async config(@Req() req) {
        return this.crud.config(req);
    }

    // This endpoint is only used to get the user's information that logging in
    @Get('profile')
    @ApiOperation({ summary: 'Get user profile' })
    async getMyProfile(@User('id') userId: string) {
        const user = await this.myProfileUseCase.execute(userId);
        return UserPresentationMapper.toProfileResponse(user);
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
        return this.crud.find(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find a record' })
    async findOne(@Param('id') id: string, @Query() query: ICrudQuery = {}) {
        return this.crud.findOne(id, query);
    }

    @Post()
    @ApiOperation({ summary: 'Create a record' })
    async create(@Body() body: RegisterUserDto) {
        return this.crud.create(body);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a record' })
    async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.crud.update(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a record' })
    async delete(@Param('id') id: string) {
        return this.crud.delete(id);
    }
}
