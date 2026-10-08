require("dotenv").config();
const {dbConnection} = require("../db/index.js");
const app = require("./app");


// DATABASE CALL AND SERVER START 
dbConnection()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("Database connection Error", error);
        process.exit(1);
    }); 