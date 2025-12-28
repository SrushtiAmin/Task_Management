import mongoose, { Schema, Document } from "mongoose";

export interface ActivityLogDocument extends Document {
  entityType: "project" | "task";
  entityId: mongoose.Types.ObjectId;

  action: "status_change" | "create" | "update" | "delete";

  oldValue?: string;
  newValue?: string;

  performedBy: mongoose.Types.ObjectId;
  performedAt: Date;
}

const activityLogSchema = new Schema<ActivityLogDocument>(
  {
    entityType: {
      type: String,
      enum: ["project", "task"],
      required: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      enum: ["status_change", "create", "update", "delete"],
      required: true,
    },

    oldValue: {
      type: String,
    },

    newValue: {
      type: String,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    performedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // we already store performedAt
  }
);

export default mongoose.model<ActivityLogDocument>(
  "ActivityLog",
  activityLogSchema
);
