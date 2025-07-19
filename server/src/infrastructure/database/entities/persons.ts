import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from './base.schema';
import { HydratedDocument } from 'mongoose';

@Schema({
    collection: 'persons',
    versionKey: false, // This will disable the __v field
})
export class Persons extends BaseSchema {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ required: true, default: Date.now })
    updatedAt: Date;
}

export type PersonsDocument = HydratedDocument<Persons>;
export const PersonsSchema = SchemaFactory.createForClass(Persons);
export default PersonsSchema;
