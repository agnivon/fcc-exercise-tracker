import { Schema } from "mongoose";

export const userSchema = new Schema({
  username: String,
});

export const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
});
