import { Schema, model, Types, Document } from 'mongoose';

export interface IComment extends Document {
  task: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<IComment>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IComment>('Comment', commentSchema);
