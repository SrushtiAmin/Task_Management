import { Schema, model, Types, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  status: 'active' | 'completed' | 'archived';
  startDate?: Date;
  endDate?: Date;

  //  ADDED
  statusHistory: {
    oldStatus: string;
    newStatus: string;
    changedBy: Types.ObjectId;
    changedAt: Date;
  }[];
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },

    startDate: Date,
    endDate: Date,

    // ADDED
    statusHistory: [
      {
        oldStatus: { type: String, required: true },
        newStatus: { type: String, required: true },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Project = model<IProject>('Project', projectSchema);
export default Project;
