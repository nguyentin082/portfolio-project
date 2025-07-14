import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagesSchema } from './entities/images.schema';
import { ImagesRepositoryImpl } from './repositories/images.repository.impl';
import { ImagesRepository } from 'src/core/repositories/images.repository';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Images', schema: ImagesSchema }]),
    ],
    providers: [
        ImagesRepositoryImpl,
        { provide: 'ImagesRepository', useClass: ImagesRepositoryImpl },
    ],
    exports: [{ provide: 'ImagesRepository', useClass: ImagesRepositoryImpl }],
})
export class DatabaseModule {}
