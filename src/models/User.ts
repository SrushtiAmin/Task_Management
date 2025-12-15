import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "pm" | "member";
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        minlength: 2,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["pm", "member"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = model<IUser>("User", userSchema);
export default User;
