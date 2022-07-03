# Share-A-Meal API
## Description

The Share a Meal back-end api provides a way to make your meal available for the public.This application is written using Node and Express. The http address to the api is: https://programmeren4-share-a-meal.herokuapp.com

## Endpoints
This list contains features all the endpoints the share-a-meal api provides. Some of the endpoints require authorization token. Create an account through the login endpoint to obtain authorization.
  

#### Login
- POST: Login (/api/auth/login)

#### User
- POST: Create user (/api/user/)
- GET: Get all users (/api/user/)
- GET: Get a user by id (/api/user/id)
- PUT: Update a user (/api/user/id)
- DELETE: Delete a user (/api/user/id)

#### Meal
- POST: Create meal(/api/meal/)
- GET: Get all meals (/api/meal/)
- GET: Get a meal by id (/api/meal/id)
- PUT: Update a meal(/api/meal/id)
- DELETE: Delete a meal(/api/meal/id)

## Run Locally

Clone the project

```bash
git clone https://github.com/Bas09/programmeren-4.git
```

Install dependencies

```bash
npm install
```

Create a local database
```bash
  cd share-a-meal
  mysql -u root
```

```sql
  CREATE DATABASE share_a_meal;
  USE share_a_meal;
  SOURCE database.sql;
```

Start the database using [XAMPP](https://www.apachefriends.org/index.html)

Start the server in cmd

```bash
npm run dev
```

Running Tests

```bash
  npm run test
```

## Packages/Libraries

- Dotenv
- Node.JS
- Express
- Mocha
- Chai
- MySQL2
- Chai-HTTP
- jsonwebtoken

## Author
Bas
