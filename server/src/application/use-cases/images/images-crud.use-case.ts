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

    private validateObjectId(id: string): void {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new HttpException(
                'Invalid ObjectId format',
                HttpStatus.BAD_REQUEST
            );
        }
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
            this.validateObjectId(id);
            return await super.findOne(id, query);
        } catch (error) {
            this.handleCrudError(error);
        }
    }

    async update(id: string, body: any) {
        try {
            this.validateObjectId(id);
            return await super.update(id, body);
        } catch (error) {
            this.handleCrudError(error);
        }
    }

    async delete(id: string) {
        try {
            this.validateObjectId(id);
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
}
