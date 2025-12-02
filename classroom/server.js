const express = require("express");
const app = express();
const users = require("./routes/user");
const posts = require("./routes/post");
const cookieParser = require("cookie-parser");  
const session = require("express-session"); 
const flash = require("connect-flash"); 

const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(cookieParser("secretcode"));

// Signed Cookie
app.get("/getSignedCookie", (req, res) => {
    res.cookie("made-in", "India", { signed: true });
    res.send("Signed cookie set");
});

// Normal Cookie Greeting
app.get("/greet", (req, res) => {
    let { name = "anonymous" } = req.cookies;
    res.send(`Hi, ${name}! Welcome back!`);
});

// Root Route
app.get("/", (req, res) => {
    res.send("Hello World!");
    console.log("Cookies:", req.cookies);
    console.log("Signed Cookies:", req.signedCookies);
});

app.get("/verify", (req, res) => {   
    console.log("Signed Cookies:", req.signedCookies);
    res.send("verified");
});

app.use("/users", users);

app.use((req,res,next)=>{
     res.locals.successMessage = req.flash("success");
    res.locals.errorMessage = req.flash("error");
    next();
});


app.get("/register", (req, res) => {
    let {name="Anonymous"} = req.query;
    console.log(req.session);
    req.session.name = name;
    
    if (name === "Anonymous") {               
        req.flash("error", "some error occured");
    } else {
        req.flash("success", "user registered successfully");
    }
    res.redirect("/hello");
});

app.get("/hello", (req, res) => { 
   
    res.render("page.ejs", { name: req.session.name }); 
});

// Start Server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

