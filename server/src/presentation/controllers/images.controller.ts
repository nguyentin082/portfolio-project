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
    UpdateFaceDto,
} from 'src/presentation/dtos/images-request.dto';

import { ImagesCrudUseCase } from 'src/application/use-cases/images/images-crud.use-case';
import { ICrudQuery } from 'src/core/crud/crud-query.decorator';
import { JwtAuthGuard } from 'src/presentation/guards/jwt-auth.guard';
import { User } from 'src/presentation/decorators/user.decorator';

@ApiTags('Images')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('images')
export class ImagesController {
    constructor(private readonly crud: ImagesCrudUseCase) {}

    // Endpoint to get API config
    @Get('config')
    @ApiOperation({ summary: 'API Config', operationId: 'config' })
    async config(@User() user: any) {
        return this.crud.config({ user });
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
    async create(@Body() body: CreateImagesDto, @User('id') userId: string) {
        // Ensure faces array is properly handled
        const imageData = {
            ...body,
            userId,
            faces: body.faces || [], // Default to empty array if not provided
        };

        return this.crud.create(imageData);
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

    // {
    //   "userId": "123",
    //   "fileKey": "testfilekey",
    //   "playgroundId": "testid",
    //   "status": "uploaded",
    //   "faces": [
    //     {
    //       "milvusId": "123",
    //       "bbox": [
    //         111,
    //         456,
    //         789,
    //         123
    //       ],
    //       "personId": "testid",
    //       "_id": {
    //         "$oid": "68765ffb64791db4450c64f8"
    //       }
    //     }
    //   ],
    //   "createdAt": {
    //     "$date": "2025-07-15T07:01:28.082Z"
    //   },
    //   "updatedAt": {
    //     "$date": "2025-07-15T14:14:57.801Z"
    //   }
    // }
    // Endpoint to update info of specific face in the image following mongodb _id and milvusId
    @Put(':id/faces/:milvusId')
    @ApiParam({
        name: 'id',
        description: 'Image ID',
        required: true,
        example: '682924b6b623d6b8aca19a4d',
    })
    @ApiParam({
        name: 'milvusId',
        description: 'Milvus ID of the face to update',
        required: true,
        example: 'c0a999e3-cda3-428c-b57e-aa6bd5883b5b',
    })
    @ApiOperation({
        summary: 'Update specific face in the image',
        description:
            'Update information of a specific face in the image using its Milvus ID',
    })
    @ApiBody({
        type: UpdateFaceDto,
        description: 'Face update data - only core fields',
        examples: {
            updatePersonInfo: {
                summary: 'Update person identity',
                value: {
                    personId: 'person_trump_001',
                },
            },
            updateBoundingBox: {
                summary: 'Update bounding box coordinates',
                value: {
                    bbox: [722.35, 260.24, 1260.34, 940.3],
                },
            },
        },
    })
    async updateFace(
        @Param('id') id: string,
        @Param('milvusId') milvusId: string,
        @Body() body: UpdateFaceDto
    ) {
        const result = await this.crud.updateFace(id, milvusId, body);
        if (!result) {
            throw new HttpException('Face not found', HttpStatus.NOT_FOUND);
        }
        return result;
    }
}
