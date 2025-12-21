import { Schema, model, Types, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  project: Types.ObjectId;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
  dueDate: Date;
  attachments: {
    filename: string;
    path: string;
    uploadedBy: Types.ObjectId;
    uploadedAt: Date;
  }[];
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: String,

    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    status: {
      type: String,
      enum: ['todo', 'in_progress', 'in_review', 'done'],
      default: 'todo',
    },

    dueDate: {
      type: Date,
      required: true,
    },

    attachments: [
      {
        filename: String,
        path: String,
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default model<ITask>('Task', taskSchema);
