const passport = require('passport');
const cookie = require('cookie-parser');
const express = require('express');
const app = express();
const path = require('path');
const PORT = '5174';
app.set('view engine', 'ejs');
app.listen(PORT, () => {
    console.log('Listening on PORT ', PORT);
});
app.use(cookie());
app.use(express.static(path.join(__dirname, 'src')));
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
app.get('/search', (req, res) => {
    res.render('search')
})