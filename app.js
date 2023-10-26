const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

app.use((req, res) => {
  console.error(`Not found: ${req.path}`);
  res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(`FATAL ERROR: ${req.path}`);
  console.error(err);

  res.status(500).json({
    ok: false,
    message: "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
