const express = require("express");
const app = express();
require("dotenv").config();

const port = process.env.PORT;
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user.routes");

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} has been called`);
    next();
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Share-a-meal app",
    });
});

app.use("/api", userRouter);

app.all("*", (req, res) => {
    res.status(401).json({
        status: 401,
        result: "End-point not found",
    });
});

// app.use((err, req, res) => {
//   res.status(err.status).json(err);
// });

app.listen(port, () => {
    console.log(`app is listening on http://localhost:${port}`);
});

module.exports = app;