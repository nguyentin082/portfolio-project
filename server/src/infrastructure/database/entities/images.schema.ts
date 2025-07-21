import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { HydratedDocument } from 'mongoose';
import { FacesItem } from 'src/core/entities/images.entity';
import { ImageStatusEnum } from 'src/core/enums/images.enum';

// Define the face schema inline
const FaceSchema = {
    milvusId: { type: String, required: false, default: '' },
    bbox: { type: [Number], required: false },
    personId: { type: String, required: false, default: '' },
};

@Schema({
    collection: 'images',
    versionKey: false, // This will disable the __v field
})
export class Images extends BaseSchema {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    fileKey: string;

    @Prop({ required: true })
    playgroundId: string;

    @Prop({ required: true, default: ImageStatusEnum.UPLOADED }) // Default status can be set as needed
    status: ImageStatusEnum;

    @Prop({ type: [FaceSchema], default: [] })
    faces: FacesItem[];

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ required: true, default: Date.now })
    updatedAt: Date;
}

export type ImagesDocument = HydratedDocument<Images>;
export const ImagesSchema = SchemaFactory.createForClass(Images);
export default ImagesSchema;
