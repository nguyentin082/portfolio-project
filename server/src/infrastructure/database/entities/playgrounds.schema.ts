import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { HydratedDocument } from 'mongoose';

@Schema({
    collection: 'playgrounds',
    versionKey: false, // This will disable the __v field
})
export class Playgrounds extends BaseSchema {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    domainName: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ required: true, default: Date.now })
    updatedAt: Date;
}

export type PlaygroundsDocument = HydratedDocument<Playgrounds>;
export const PlaygroundsSchema = SchemaFactory.createForClass(Playgrounds);
export default PlaygroundsSchema;
