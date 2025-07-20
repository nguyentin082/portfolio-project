import { Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CrudUseCase } from 'src/core/crud/crud.use-case';
import { Playgrounds } from 'src/core/entities/playgrounds.entity';
import { PlaygroundsRepository } from 'src/core/repositories/playgrounds.repository';
import { PlaygroundsMapper } from 'src/infrastructure/database/mappers/playgrounds.mapper';
import { ICrudQuery } from 'src/core/crud/crud-query.decorator';

export class PlaygroundsCrudUseCase extends CrudUseCase {
    constructor(
        @Inject('PlaygroundsRepository')
        private readonly repo: PlaygroundsRepository
    ) {
        super(repo.getModel(), {
            mapper: PlaygroundsMapper.toDomain,
            model: Playgrounds,
            routes: {
                create: {
                    transform: PlaygroundsMapper.toPersistence,
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

        console.error('Playgrounds CRUD error:', error);
        throw new HttpException(
            'Internal server error',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    async create(body: any) {
        try {
            return await super.create(body);
        } catch (error) {
            this.handleCrudError(error);
        }
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

    // Additional playground-specific methods can be added here
    async findByUserId(userId: string, query: ICrudQuery = {}) {
        try {
            const searchQuery = {
                ...query,
                where: JSON.stringify({ userId }),
            };
            return await this.find(searchQuery);
        } catch (error) {
            this.handleCrudError(error);
        }
    }
}
