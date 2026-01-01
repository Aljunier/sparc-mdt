import express from "express";
import cors from "cors";
import path from "path";
import "dotenv/config";
import routes from "#routes/index";
import { testDbConnection } from "#config/database";

const app = express();
const PORT = process.env.PORT || 3050;
const __dirname = path.resolve();

testDbConnection();

// Middleware //

// Enable CORS for development
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
}
app.use(express.json());

// Routes //
app.use("/api", routes);

// Serve frontend in production //
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start server //
app.listen(PORT, () => {
  console.log("Server started on PORT: ", PORT);
});
