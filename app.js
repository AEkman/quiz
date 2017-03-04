var express = require('express');
var body = require('body-parser');
var connection = require('./public/javascripts/mysqlconnection');
var databaseFunctions = require('./public/javascripts/database');

// Start express
var app = express();

app.use(body.json()); // Parses html data to JSON
app.use(body.urlencoded({extended: true})); // If data is sent URL encoded, parse to JSON
connection.init();

// Middleware to log all requests
// app.use(function(req, res, next) {
//     console.log(`${req.method} request for '${req.url}' - ${JSON.stringify(req.body)}`);
//     next();
// });

// Set static folder
app.use(express.static(__dirname + '/public'));

// View engine
app.set('view engine', 'ejs');

// Global variables
app.locals.pageTitle = "Quiz Maker";

// Routes
/* Home/Login */
app.get('/', function(req, res) {
    res.render('index', {
        title: 'Home',
        classname: 'home'
    });
});

/* Create Quiz */
app.get('/createquiz', function(req, res) {
    res.render('createquiz', {
        title: 'Create Quiz',
        classname: 'createquiz'
    });
});

/* Take Quiz */
app.get('/takequiz', function(req, res) {
    connection.acquire(function (err, con) {
        con.query('SELECT * FROM quiz', function (err, rows) {
            con.release();
            if(err) {
                console.log(err);
            } else {
                loadquizes = JSON.parse(JSON.stringify(rows));
                res.render('takeQuiz', {
                    loadquizes:loadquizes,
                    title: 'takequiz',
                    classname: 'takequiz'
                });
            }
        });
    });
});

app.get('/takequiz/:id', function(req, res) {
    connection.acquire(function (err, con) {
        var quizId = req.params.id;
        con.query('SELECT * FROM quiz WHERE quizId = ?', quizId, function (err, qid) {
            if(err) {
                console.log(err);
            } else {
                con.query('SELECT * FROM question WHERE questionQuizId = ?', quizId, function (err, question) {
                    if (err) {
                        console.log(err);
                    } else {
                        con.query('SELECT * FROM answers WHERE answerQuestionid IN (SELECT questionId FROM question WHERE questionQuizid = ?)', quizId, function (err, answer) {
                            con.release();
                            if (err) {
                                console.log(err);
                            } else {
                                loadQuizes = JSON.parse(JSON.stringify(qid));
                                quizQuestions = JSON.parse(JSON.stringify(question));
                                answers = JSON.parse(JSON.stringify(answer));
                                res.render('takequizbyid', {
                                    loadQuizes: loadQuizes,
                                    quizQuestions: quizQuestions,
                                    answers: answers,
                                    title: 'Take quiz',
                                    classname: 'takequizbyid'
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

app.post('/takequiz/:id', function(req, res) {
try {
    var reqObj = req.body;
    console.log(res);
    connection.acquire(function(err, con){
        if(err) {
            // console.log('SQL Connection error: ', err);
            return next(err);
        } else {
            // var insertSql = "INSERT INTO quiz SET ?";
            // var insertValues = {
            //     answerId: req.Obj.name
            // };
            // var query = con.query(insertSql, insertValues, function(err, result) {
            //     if (err) {
            //         console.error('SWL error: ', err);
            //         return next(err);
            //     }
            //     // var quizId = result.inesrtId;
            // });
        }
        });
    }
    catch(ex) {
    console.error("Internal error: " + ex);
    return next(ex);
    }
});

/* Results */
app.get('/results', function(req, res) {
    res.render('results', {
        title: 'Results',
        classname: 'results'
    });
});

/* Profile */
app.get('/profile', function(req, res) {
    res.render('profile', {
        title: 'Profile',
        classname: 'profile'
    });
});

/* Settings */
app.get('/settings', function(req, res) {
    connection.acquire(function (err, con) {
        con.query('SELECT * FROM user', function (err, rows) {
            if(err) {
                console.log(err);
            } else {
                con.query('SELECT * FROM quiz', function (err, quizes) {
                    con.release();
                    if(err) {
                        console.log(err);
                    } else {
                        obj = JSON.parse(JSON.stringify(rows));
                        quiz = JSON.parse(JSON.stringify(quizes));
                        res.render('settings', {
                            obj:obj,
                            quiz:quiz,
                            title: 'Settings',
                            classname: 'settings'
                        });
                    }
                });
            }
        });
    });
});

/*  countdownclock */
app.get('/countdownclock', function(req, res) {
    connection.acquire(function (err, con) {
        con.query('SELECT * FROM quiz', function (err, rows) {
            con.release();
            if(err) {
                console.log(err);
            } else {
                obj = JSON.parse(JSON.stringify(rows));
                res.render('settings', {
                    obj:obj,
                    title: 'Settings',
                    classname: 'settings'
                });
            }
        });
    });
});

/* User */
app.get('/user', function(req, res) {
    res.render('user', {
        title: 'User',
        classname: 'user'
    });
});

/* Creator */
app.get('/creator', function(req, res) {
    res.render('creator', {
        title: 'Creator',
        classname: 'creator'
    });
});

/* Admin */
app.get('/admin', function(req, res) {
    res.render('admin', {
        title: 'Admin',
        classname: 'admin'
    });
});

/* Create question for quiz page */
app.get('/createquizquestions', function(req, res) {
    res.render('createquizquestions', {
        title: 'createquizquestions',
        classname: 'createquizquestions'
    });
});

/*  send the input data from settings --> createUser --> database */
app.post('/settings', function(req, res) {
    var user = {
        mail: req.body.mail,
        name: req.body.name,
        password: req.body.password,
        groups: req.body.groups,
        accountLevel: req.body.accountLevel
    };
    databaseFunctions.createUser(user, res);
});

var stored_quizId;

/*  send input data from Create quiz form */
app.post('/createquiz', function (req, res) {
    function createQuiz() {
        var quiz = {
            quizName: req.body.quizName,
            dateFinished: req.body.dateFinished,
            times: req.body.times,
            score: req.body.score
        };
        databaseFunctions.createQuiz(quiz);
    };
    function getQuizId() {
        connection.acquire(function (err, con) {
        con.query('SELECT quizId FROM quizdb.quiz ORDER BY quizId DESC LIMIT 1', function (err, quizIdres) {
            con.release();
            if (err) {
                console.log(err)
            } else {
                obj = JSON.parse(JSON.stringify(quizIdres));
                obj.forEach(function (id) {
                    stored_quizId = id.quizId;
                    console.log("Stored QuizId: " + stored_quizId);
                });
            }
        });
    });

};
    createQuiz();
    setTimeout(getQuizId, 500);
    return res.redirect('/createquizquestions');
});

function addNumberOfQuestions() {
    numberOfQuestions ++;
    console.log("Quiz number added");
};

var stored_questionID;
var answers = [];
var numberOfQuestions = 1;
//Taking in form for creating a question and connected answers.
app.post('/createquizquestions', function (req, res) {
    function createQuestion() {
        // Collection data from question form and creating an array.
        var question = {
            question: req.body.question,
            questionQuizid: stored_quizId
        };
        // Sending the question array to function for creating a query and sending to database
        databaseFunctions.createQuestion(question);
    };
    function getQuestionId() {
            connection.acquire(function (err, con) {
            con.query('SELECT questionId FROM question ORDER BY questionId DESC LIMIT 1', function (err, questionIdRes) {
                con.release();
                if (err) {
                    console.log(err)
                } else {
                    obj = JSON.parse(JSON.stringify(questionIdRes));
                    obj.forEach(function (id) {
                        stored_questionID = id.questionId;
                        console.log("Stored questionId: " + stored_questionID);
                    });
                }
            });
        });
    };
    function createAnswrs() {
        // Collection answers and if they are correct or not and save to an array.
        var store_answers = req.body.answer;
        var store_correct = req.body.correct;

        //Looping trough answers and creating an object for each.
        for (var o = 0; o < store_answers.length; o++) {
            var answer = {
                answer: store_answers[o],
                correct: store_correct[o],
                answerQuestionid: stored_questionID
            };
            answers.push(answer); //Pushing answer objects to answers array.
        }
        //Looping trough the answers and sending them to function for storing in database
        for (var i = 0; i < answers.length; i++) {
            databaseFunctions.createAnswer(answers[i]);
        }
};
    function redirect() {
        if(numberOfQuestions > 0) {
            return res.redirect("/createquiz");
        } else {
            return res.redirect(req.get('referer'));
        }
    }

    createQuestion();
    setTimeout(getQuestionId, 500);
    setTimeout(createAnswrs, 1000);
    setTimeout(redirect, 1500);
    answers = [];
});


// Start server on port 3000
app.set('port', process.env.PORT || 3000); // use port 3000 unless there exists a preconfigured port
var server = app.listen(app.get('port'), function() {
    console.log('Listening on port:' +app.get('port'));
});