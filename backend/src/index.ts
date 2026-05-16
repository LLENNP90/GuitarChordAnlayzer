import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import savedRouter from "./routes/saved.js";
// import registerRouter from "./routes/register.js";
// import savedRouter from "./routes/saved.js";
import { errorHandler } from "./error/error.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Backend running" });
});

const PORT = process.env.PORT || 5000;

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "WORKING!",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use("/api/auth", userRouter);
app.use("/api/saved", savedRouter)
// app.use("/api/auth", registerRouter);
// app.use("/api/saved", savedRouter);

app.use(errorHandler);