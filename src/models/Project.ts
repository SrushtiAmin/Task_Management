import { Schema, model, Types } from "mongoose";

export interface IProject {
    name: string;
    description?: string;
    createdBy: Types.ObjectId;
    members: Types.ObjectId[];
    status: "active" | "completed";
    startDate?: Date;
    endDate?: Date;
}

const projectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: true,
        },

        description: {
            type: String,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
        },

        startDate: Date,
        endDate: Date,
    },
    {
        timestamps: true,
    }
);

export const Project = model<IProject>("Project", projectSchema);
