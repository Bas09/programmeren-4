const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];

app.all("*", (req, res, next) => {
    const method = req.method;
    console.log(`Method ${method} is aangeroepen`);
    next();
});


app.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

// UC-201 Register as a new user

app.post("/api/user", (req, res) => {
    let user = req.body;

    user = { firstName
    };
    console.log(user);
    database.push(user);
        res.status(201).json({
        status: 201,
        result: database,
    });
});


// UC-202 Get all users
app.get("/api/user", (req, res, next) => {
    res.status(200).json({
        status: 200,
        result: database,
    });
});

// UC-203 Request personal user profile
app.get("/api/user/profile")


// UC-204 Get single user by ID

// UC-205 Update a single user

// UC-206 Delete a user





    app.get("/api/movie/:movieId", (req, res, next) => {
        const movieId = req.params.movieId;
        console.log(`Movie met ID ${movieId} gezocht`);
        let movie = database.filter((item) => item.id == movieId);
        if (movie.length > 0) {
            console.log(movie);
            res.status(200).json({
                status: 200,
                result: movie,
            });
        } else {
            res.status(401).json({
                status: 401,
                result: `Movie with ID ${movieId} not found`,
            });
        }
    });

    app.get("/api/movie", (req, res, next) => {
        res.status(200).json({
            status: 200,
            result: database,
        });
    });

    app.all("*", (req, res) => {
        res.status(401).json({
            status: 401,
            result: "End-point not found",
        });
    });

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });