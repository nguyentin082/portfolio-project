import { Inject, HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CrudUseCase } from 'src/core/crud/crud.use-case';
import { Images } from 'src/core/entities/images.entity';
import { ImagesRepository } from 'src/core/repositories/images.repository';
import { ImagesMapper } from 'src/infrastructure/database/mappers/images.mapper';
import { ICrudQuery } from 'src/core/crud/crud-query.decorator';

export class ImagesCrudUseCase extends CrudUseCase {
    constructor(
        @Inject('ImagesRepository')
        private readonly repo: ImagesRepository
    ) {
        super(repo.getModel(), {
            mapper: ImagesMapper.toDomain,
            model: Images,
            routes: {
                create: {
                    transform: ImagesMapper.toPersistence,
                },
            },
        });
    }

    private handleCrudError(error: any): never {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            throw new HttpException(
                'Invalid ObjectId format',
                HttpStatus.BAD_REQUEST
            );
        }

        if (error instanceof HttpException) {
            throw error;
        }

        console.error('Crud error:', error);
        throw new HttpException(
            'Internal server error',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    async findOne(id: string, query: ICrudQuery = {}) {
        try {
            return await super.findOne(id, query);
        } catch (error) {
            this.handleCrudError(error);
        }
    }

    async update(id: string, body: any) {
        try {
            return await super.update(id, body);
        } catch (error) {
            this.handleCrudError(error);
        }
    }

    async delete(id: string) {
        try {
            return await super.delete(id);
        } catch (error) {
            this.handleCrudError(error);
        }
    }

    async find(query: ICrudQuery = {}) {
        try {
            return await super.find(query);
        } catch (error) {
            if (
                error instanceof SyntaxError &&
                error.message.includes('JSON')
            ) {
                throw new HttpException(
                    'Invalid JSON format in query parameters',
                    HttpStatus.BAD_REQUEST
                );
            }
            this.handleCrudError(error);
        }
    }

    // {
    //   "userId": "685b7426961a92e9ec1d2a1d",
    //   "fileKey": "face-recognition/1ec3dc0a-fe66-4c24-a5af-7ce2f0a9155e-trumpt.jpeg",
    //   "playgroundId": "123",
    //   "faces": [
    //     {
    //       "milvusId": "c0a999e3-cda3-428c-b57e-aa6bd5883b5b",
    //       "bbox": [722.3582763671875, 260.23760986328125, 1260.3406982421875, 940.298828125],
    //       "personId": "unknown",
    //     }
    //   ],
    //   "createdAt": { "$date": "2025-07-19T08:29:26.826Z" },
    //   "updatedAt": { "$date": "2025-07-19T08:49:17.442Z" }
    // }
    // Update info of specific face in the image following mongodb _id and milvusId
    async updateFace(id: string, milvusId: string, faceUpdate: any) {
        try {
            const image = await this.repo.findById(id);
            if (!image) {
                throw new HttpException(
                    'Image not found',
                    HttpStatus.NOT_FOUND
                );
            }

            const faceIndex = image.faces.findIndex(
                (face) => face.milvusId === milvusId
            );
            if (faceIndex === -1) {
                throw new HttpException('Face not found', HttpStatus.NOT_FOUND);
            }

            // Define allowed face fields that can be updated (based on actual data structure)
            const allowedFaceFields = ['personId', 'bbox', 'milvusId'];

            // Extract only face-related fields from the update data
            const faceUpdateData: any = {};
            for (const field of allowedFaceFields) {
                if (faceUpdate[field] !== undefined) {
                    faceUpdateData[field] = faceUpdate[field];
                }
            }

            // Update the specific face with only allowed fields
            image.faces[faceIndex] = {
                ...image.faces[faceIndex],
                ...faceUpdateData,
            };

            // Update the image with modified faces array and set updatedAt
            const updateData = {
                faces: image.faces,
                updatedAt: new Date(),
            };

            const updatedImage = await this.repo
                .getModel()
                .findOneAndUpdate({ _id: id }, updateData, {
                    new: true,
                    runValidators: true,
                });

            if (!updatedImage) {
                throw new HttpException(
                    'Failed to update face',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            return {
                success: true,
                data: {
                    _id: updatedImage._id.toString(),
                    userId: updatedImage.userId,
                    fileKey: updatedImage.fileKey,
                    playgroundId: updatedImage.playgroundId,
                    faces: updatedImage.faces,
                    createdAt: updatedImage.createdAt,
                    updatedAt: updatedImage.updatedAt,
                },
                message: `Face with milvusId ${milvusId} updated successfully`,
            };
        } catch (error) {
            this.handleCrudError(error);
        }
    }
}
