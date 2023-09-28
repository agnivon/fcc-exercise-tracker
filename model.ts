import mongoose from "mongoose";
import { exerciseSchema, userSchema } from "./schema";

export const User = mongoose.model("user", userSchema);

export const Exercise = mongoose.model("exercise", exerciseSchema);
