import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";

import { Exercise, User } from "./model";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI || "";

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app
  .post("/api/users", async (req: Request, res: Response) => {
    try {
      if (typeof req.body.username === "string") {
        const newUser = new User({ username: req.body.username });
        return res.json(await newUser.save());
      } else {
        return res.status(400).send();
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  })
  .get("/api/users", async (_req: Request, res: Response) => {
    try {
      return res.json(await User.find());
    } catch (err) {
      return res.status(500).send(err);
    }
  });

app.post("/api/users/:_id/exercises", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).send("User not found");
    const description = req.body.description;
    const duration = Number(req.body.duration);
    const date = req.body.date ? new Date(req.body.date) : new Date();

    if (description && duration && user.username) {
      const exercise = new Exercise({
        username: user.username,
        description,
        duration,
        date,
      });
      const newExercise = (await exercise.save()).toObject();
      return res.json({
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date?.toDateString(),
        username: user.username,
        _id: user._id,
      });
    } else {
      return res.status(400).send("Invalid values submitted.");
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get("/api/users/:_id/logs", async (req: Request, res: Response) => {
  try {
    const { from, to, limit } = req.query;

    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).send("User not found");

    let exerciseQuery = Exercise.find({ username: user.username });

    if (typeof from === "string")
      exerciseQuery = exerciseQuery.find({ date: { $gte: from } });
    if (typeof to === "string")
      exerciseQuery = exerciseQuery.find({ date: { $lte: to } });
    if (typeof Number(limit))
      exerciseQuery = exerciseQuery.limit(Number(limit));

    const exercises = await exerciseQuery.exec();

    return res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log: exercises.map((e) => ({
        description: e.description,
        duration: e.duration,
        date: e.date?.toDateString(),
      })),
    });
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.listen(port, async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  } catch (e) {
    console.error(e);
    console.log(`Server run failed`);
  }
});
