const assert = require('assert');

// UC-201 Register as a new user
addUser: (req, res) => {
    const user = req.body;
    const emailAdress = req.body.emailAdress;

    if (emailAdress != null) {
        if (database.filter((item) => item.emailAdress == emailAdress).length > 0) {
            res.status(400).json({
                statusCode: 400,
                message: 'EmailAdress already taken!'
            });
        } else {
            databaseId++
            database.push({
                id: databaseId,
                ...user,
            });
            res.json(database.filter((item) => item.emailAdress == emailAdress));
        }
    } else {
        res.status(400).json({
            statusCode: 400,
            message: 'body does not cointain emailadress!', 
        });
    }
};