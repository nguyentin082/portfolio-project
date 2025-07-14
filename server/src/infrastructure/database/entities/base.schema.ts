import { Prop } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export class BaseSchema {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    default: () => new Types.ObjectId(),
  })
  _id: string;
}
