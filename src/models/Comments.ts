import { Schema, model, Types, Document } from "mongoose";

export interface IComment extends Document {
  task: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  task: {
    type: Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = model<IComment>("Comment", commentSchema);
export default Comment;
