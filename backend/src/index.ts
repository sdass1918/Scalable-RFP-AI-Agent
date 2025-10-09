import express from "express";
import cors from "cors";
import { rfpRoutes } from "./routes/rfpRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rfp', rfpRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});