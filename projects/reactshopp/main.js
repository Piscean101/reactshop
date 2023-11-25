const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookie = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const PORT = '5174';
app.set('view engine', 'ejs');
app.listen(PORT, () => {
    console.log('Listening on PORT ', PORT);
});
app.use(cookie());
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
    secret: "bbw",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        secure: false,
        maxAge: 900000,
        minAge: 300000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'secret',
    database: 'reactshopp',
    port: 3306
});
db.connect((err) => {
    if(!err) {
        console.log('Paparazzi')
    } else {
        console.log(err)
    }
});
/*app.get('/search', (req, res) => {
    if (!req.isAuthenticated()) {
         res.redirect('/');
    }
});*/
app.get('/search', (req, res) => {
    db.query(`SELECT * FROM inventory ORDER BY 3`, (err, data) => {
        for (let i = 0 ; i < data.length ; i ++) {
            if (data[i].onsale) {
                data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
            }
        }
        if (req.isAuthenticated()) {

        res.render('search' , {
            data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
        })  } else {
            res.render('search', {
                data: data
            })
        }
    })
});
app.get('/addCart/:id', (req, res) => {
    db.query(`SELECT * FROM inventory WHERE id = ${req.params.id}`, (err, data) => {
        // res.render('search')
        if (req.isAuthenticated()){
        db.query(`INSERT INTO cart (item_name, price, user_id, username) VALUES 
                    ('${data[0].name}', ${data[0].cost}, ${req.user.id}, '${req.user.nickname}')`, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    })}
        res.redirect('/search')
    })
});
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});
app.post('/profile/OH/:username', (req, res) => {
    res.render('orderhistory');
});
app.post('/profile/CO/:username', (req, res) => {
    if(req.isAuthenticated()){
    db.query(`SELECT * FROM cart WHERE user_id = ${req.user.id}`, (err, data) => {
        console.log(data);
        res.render('checkout', {
            data: data
        });
    })}
})
// THE FILTER ALGORITHM 
// onsale = integer
// order = 'L2H' or 'H2L' meaning Lowest to Highest and Highest to Lowest
// category = 'string' 
app.get('/filter', (req, res) => {
    if (req.query.onsale && !req.query.order && !req.query.category) {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL ORDER BY 3`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    }
    // <- SALE N.ORDER N.CAT
    // SALE N.ORDER CAT ->
    else if (req.query.onsale && !req.query.order && req.query.category) {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL AND party = '${req.query.category}' ORDER BY 3`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    } 
    // <- SALE N.ORDER CAT
    // SALE ORDER N.CAT -> 
    else if (req.query.onsale && req.query.order && !req.query.category) {
        if (req.query.order == 'L2H') {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL ORDER BY 4`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    } else {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    }
    }
    // <- SALE ORDER N.CAT
    // SALE ORDER CAT ->
    else if (req.query.onsale && req.query.order && req.query.category) {
        if (req.query.order == 'L2H') {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL AND party = '${req.query.category}' ORDER BY 4`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    } else {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL AND party = '${req.query.category}' ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    }
    } 
    // <- SALE ORDER CAT 
      // N.SALE ORDER CAT ->
      else if (!req.query.onsale && req.query.order && req.query.category) {
        if (req.query.order == 'L2H') {
        db.query(`SELECT * FROM inventory WHERE party = '${req.query.category}' ORDER BY 4`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    } else {
        db.query(`SELECT * FROM inventory WHERE party = '${req.query.category}' ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    }
    } 
    // <- N.SALE ORDER CAT 
    // ORDER ->
    else if (req.query.order) {
        if (req.query.order == 'L2H') {
        db.query(`SELECT * FROM inventory ORDER BY 4`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    } else {
        db.query(`SELECT * FROM inventory ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    }
    }
    // <- ORDER
    // CAT ->
    else if (req.query.category) {
        db.query(`SELECT * FROM inventory WHERE party = '${req.query.category}' ORDER BY 3`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            if (req.isAuthenticated()) {

                res.render('search' , {
                    data: data , welcome: `Welcome, ${req.user.nickname}` , user: req.user
                })  } else {
                    res.render('search', {
                        data: data
                    })
                }
        })
    }
    // <- CAT
    else {
        res.redirect('/');
    }
})


/* REGISTRATION LOGIN CONFIG */

app.post('/register', (req, res, next) => {
    db.query(`SELECT * FROM customers WHERE username = '${req.body.username}'`, (err, data) => {
        if (data.length == 1) {
            console.log('username taken')
            res.redirect('/home');
        } else {
            db.query(`INSERT INTO customers (username, password, nickname) VALUES ('${req.body.username}', '${req.body.password}',' ${req.body.nickname}')`)
            console.log('register success')
            res.redirect('/home')
        }
    })
});

app.post('/login/password', (req, res, next) => {
    db.query(`SELECT * FROM customers WHERE username = '${req.body.username}' AND password = '${req.body.password}'`, (err, data) => {
        if (data.length > 0) {
            console.log(data)
            next();
        } else {
            console.log('not found')
            res.redirect('/');
        }
    })
});
app.post('/login/password', (req, res, next) => {
    initialize(
        passport,
        req.body.username,
        req.body.password
    )
    next();
});
app.post('/login/password', passport.authenticate('local', {
    successRedirect: '/search',
    failureRedirect: '/'
}));
app.get('/logout', (req, res) => {
    req.session.destroy();
    req.logOut(() => {
        console.log('Logged Out')
    });
    res.redirect('/');
})

function initialize (passport, username, password) {
    const authenticate = async (username, password, done) => {
        let search = `SELECT * FROM customers WHERE username = '${username}' AND password = '${password}'`;
        db.query(search, (err, data) => {
            if (data.length === 1) {
                const user = data[0];
                return done (null, user)
            }
            else {
                return done(null, false);
            }
        })
    }
    passport.use(new LocalStrategy(authenticate));
    
    passport.serializeUser( function(user, done) { return done(null, user)});
    passport.deserializeUser( function(user, done) { return done(null, user)});
}



app.get('*', (req, res) => {
    res.send('We could not find the page you were looking for');
})