import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagesSchema } from './entities/images.schema';
import { PersonsSchema } from './entities/persons.schema';
import { PlaygroundsSchema } from './entities/playgrounds.schema';
import { ImagesRepositoryImpl } from './repositories/images.repository.impl';
import { PersonsRepositoryImpl } from './repositories/persons.repository';
import { PlaygroundsRepositoryImpl } from './repositories/playgrounds.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Images', schema: ImagesSchema },
            { name: 'Persons', schema: PersonsSchema },
            { name: 'Playgrounds', schema: PlaygroundsSchema },
        ]),
    ],
    providers: [
        ImagesRepositoryImpl,
        PersonsRepositoryImpl,
        PlaygroundsRepositoryImpl,
        { provide: 'ImagesRepository', useClass: ImagesRepositoryImpl },
        { provide: 'PersonsRepository', useClass: PersonsRepositoryImpl },
        {
            provide: 'PlaygroundsRepository',
            useClass: PlaygroundsRepositoryImpl,
        },
    ],
    exports: [
        { provide: 'ImagesRepository', useClass: ImagesRepositoryImpl },
        { provide: 'PersonsRepository', useClass: PersonsRepositoryImpl },
        {
            provide: 'PlaygroundsRepository',
            useClass: PlaygroundsRepositoryImpl,
        },
    ],
})
export class DatabaseModule {}
