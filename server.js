import express from "express";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); //DNS issue
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import Routes from "./routes/Routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", Routes);

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});