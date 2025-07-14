import { UserRepository } from '../../../core/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { CrudUseCase } from 'src/core/crud/crud.use-case';
import { User } from 'src/core/entities/user.entity';
import { UserMapper } from 'src/infrastructure/database/mappers/user.mapper';

export class UserCrudUseCase extends CrudUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly repo: UserRepository,
  ) {
    super(repo.getModel(), {
      mapper: UserMapper.toDomain,
      model: User,
    });
  }
}
