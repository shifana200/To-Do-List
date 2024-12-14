const express = require('express')
const app= express()
const env = require('dotenv').config()
const path = require('path');
const connectDB =require('./config/db')
const bodyParser = require('body-parser');
const User = require('./models/userSchema');
const session = require('express-session');
const userRouter =require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')
connectDB();


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000

    }
}))

app.set('views',[path.join(__dirname, 'views/user'),path.join(__dirname, 'views/admin')]);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',userRouter)
app.use("/admin",adminRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

module.exports =app;