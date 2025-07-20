import { Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CrudUseCase } from 'src/core/crud/crud.use-case';
import { Persons } from 'src/core/entities/persons.entity';
import { PersonsRepository } from 'src/core/repositories/persons.repository';
import { PersonsMapper } from 'src/infrastructure/database/mappers/persons.mapper';
import { ICrudQuery } from 'src/core/crud/crud-query.decorator';

export class PersonsCrudUseCase extends CrudUseCase {
    constructor(
        @Inject('PersonsRepository')
        private readonly repo: PersonsRepository
    ) {
        super(repo.getModel(), {
            mapper: PersonsMapper.toDomain,
            model: Persons,
            routes: {
                create: {
                    transform: PersonsMapper.toPersistence,
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

        console.error('Persons CRUD error:', error);
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

    // Additional person-specific methods can be added here
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
