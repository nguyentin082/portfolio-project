import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { HydratedDocument } from 'mongoose';

// Define the face schema inline
const FaceSchema = {
    bbox: { type: [Number], required: true },
    name: { type: String, required: true },
    vectorId: { type: String, required: true },
    personId: { type: String, required: true },
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

    @Prop({ type: [FaceSchema], default: [] })
    faces: any[];

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ required: true, default: Date.now })
    updatedAt: Date;
}

export type ImagesDocument = HydratedDocument<Images>;
export const ImagesSchema = SchemaFactory.createForClass(Images);
export default ImagesSchema;
