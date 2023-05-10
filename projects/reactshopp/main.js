const passport = require('passport');
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
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
    secret: "bbw",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
        secure: false,
        maxAge: 1800000,
        minAge: 300000
    }
}));
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
app.get('/', (req, res) => {
    db.query(`SELECT * FROM inventory ORDER BY 3`, (err, data) => {
        for (let i = 0 ; i < data.length ; i ++) {
            if (data[i].onsale) {
                data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
            }
        }
        res.render('search' , {
            data: data
        })
    })
})
app.get('/addCart/:id', (req, res) => {
    res.redirect('/');
})
app.get('/home', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
})
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
})

// onsale = integer
// order = 'L2H' or 'H2L'
// category = 'string'
app.get('/filter', (req, res) => {
    if (req.query.onsale && !req.query.order && !req.query.category) {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            res.render('search' , {
                data: data
            })
        })
    }
    // <- SALE N.ORDER N.CAT
    // SALE N.ORDER CAT ->
    else if (req.query.onsale && !req.query.order && req.query.category) {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL AND party = '${req.query.category}'`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            res.render('search' , {
                data: data
            })
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
            res.render('search' , {
                data: data
            })
        })
    } else {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            res.render('search' , {
                data: data
            })
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
            res.render('search' , {
                data: data
            })
        })
    } else {
        db.query(`SELECT * FROM inventory WHERE onsale IS NOT NULL AND party = '${req.query.category}' ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            res.render('search' , {
                data: data
            })
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
            res.render('search' , {
                data: data
            })
        })
    } else {
        db.query(`SELECT * FROM inventory WHERE party = '${req.query.category}' ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            res.render('search' , {
                data: data
            })
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
            res.render('search' , {
                data: data
            })
        })
    } else {
        db.query(`SELECT * FROM inventory ORDER BY 4 DESC`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            res.render('search' , {
                data: data
            })
        })
    }
    }
    // <- ORDER
    // CAT ->
    else if (req.query.category) {
        db.query(`SELECT * FROM inventory WHERE party = '${req.query.category}'`, (err, data) => {
            for (let i = 0 ; i < data.length ; i ++) {
                if (data[i].onsale) {
                    data[i].saleprice = Math.ceil(data[i].cost - ((data[i].cost * data[i].onsale)/100));
                }
            }
            res.render('search' , {
                data: data
            })
        })
    }
    // <- CAT
    else {
        res.redirect('/');
    }
})








app.get('*', (req, res) => {
    res.send('We could not find the page you were looking for');
})