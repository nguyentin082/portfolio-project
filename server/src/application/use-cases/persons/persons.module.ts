import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { PersonsCrudUseCase } from 'src/application/use-cases/persons/persons-crud.use-case';
import { PersonsController } from 'src/presentation/controllers/persons.controller';

@Module({
    imports: [DatabaseModule],
    controllers: [PersonsController],
    providers: [
        PersonsCrudUseCase,
        {
            provide: 'PersonsCrudUseCase',
            useClass: PersonsCrudUseCase,
        },
    ],
    exports: [PersonsCrudUseCase],
})
export class PersonsModule {}
