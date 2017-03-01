/**
 * Created by erica on 2017-02-25.
 */
var connection = require('./mysqlconnection');
var latestID;

function User() {
    /*  function that gets data from database table user*/
    this.get = function (res) {
        connection.acquire(function (err, con) {
            con.query('SELECT mail, name FROM user', function (err, result) {
                con.release();
                res.send(result);
            });
        });
        console.log('SELECT * FROM Databas kördes!')
    };
    /* Insert user data into mySQL database */

    this.getUsers = function (res) {
        connection.acquire(function (err, con) {
            con.query('SELECT * FROM user', function (err, result) {
                con.release();
                if(err) {
                    console.log(err);
                } else {
                    obj = {print: result};
                    console.log(obj);
                }
            });
        });
    };

    // Creating a user function
    this.createUser = function (user, res) {
        console.log(user);
        connection.acquire(function (err, con) {
            con.query("INSERT INTO user SET ?", user, function (err) {
                con.release();
                if(err) {
                    console.log(err);
                    res.send({status: 1, message: 'User creaton failed'});
                } else {
                    console.log('Usercreated successfully');
                    res.send({status: 0, message: 'User created successfully'});
                }
            });
        });
    };

    //Create quest funktion
    this.createQuestion = function (question, res) {
        console.log(question);
        connection.acquire(function (err, con) {
            con.query("INSERT INTO question SET ?", question, function (err) {
                con.release();
                if(err) {
                    console.log(err);
                    res.send({status: 1, message: 'Quest creation failed'});
                } else {
                    console.log('Quest created successfully');
                    res.send({status: 0, message: 'Quest created successfully'});
                }
            });
        });
    };

    //Create answer function
    this.createAnswer = function (answer, res) {
        console.log(answer);
        connection.acquire(function (err, con) {
            con.query("INSERT INTO answers SET ?", answer, function (err) {
                con.release();
                if(err) {
                    console.log(err);
                    res.send({status: 1, message: 'Answer creaton failed'});
                } else {
                    console.log('Answer created successfully');
                    res.send({status: 0, message: 'Answer created successfully'});
                }
            });
        });
    };
    //Create quiz function, and returning the ID from the last created quiz
    this.createQuiz = function (quiz, res) {
        console.log(quiz);
        connection.acquire(function (err, con) {
            con.query("INSERT INTO quiz SET ?", quiz, function (err) {
                con.release();
                if(err) {
                    console.log(err);
                    res.send({status: 1, message: 'Quiz create failed'});
                } else {
                    con.query("SELECT LAST_INSERT_ID();", function (err, result) {
                        res.send(result);
                        console.log(result);
                    });
                }
            });
        });
    };
}
module.exports = new User();
