import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagesSchema } from './entities/images.schema';
import { PersonsSchema } from './entities/persons';
import { ImagesRepositoryImpl } from './repositories/images.repository.impl';
import { PersonsRepositoryImpl } from './repositories/persons.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Images', schema: ImagesSchema },
            { name: 'Persons', schema: PersonsSchema },
        ]),
    ],
    providers: [
        ImagesRepositoryImpl,
        PersonsRepositoryImpl,
        { provide: 'ImagesRepository', useClass: ImagesRepositoryImpl },
        { provide: 'PersonsRepository', useClass: PersonsRepositoryImpl },
    ],
    exports: [
        { provide: 'ImagesRepository', useClass: ImagesRepositoryImpl },
        { provide: 'PersonsRepository', useClass: PersonsRepositoryImpl },
    ],
})
export class DatabaseModule {}
