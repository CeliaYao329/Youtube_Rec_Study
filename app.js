const express               = require("express"),
      mongoose              = require("mongoose"),
      bodyParser            = require("body-parser"),
      fs                    = require("fs"),
      util                  = require("util"),
      keys                  = require("./config/keys"),
      passport              = require("passport"),
      passportSetup         = require("./config/passport-setup.js"),
      cookieSession         = require("cookie-session"),
      authRoutes            = require("./routes/auth-routes.js"),
      uploadRoutes          = require("./routes/upload-routes.js")
      infoRoutes            = require("./routes/info-routes.js"),
      User                  = require("./models/user");

mongoose.Promise = global.Promise;
const databaseUri = keys.mongo.mongoURI;
mongoose.connect(databaseUri)
      .then(() => console.log('Database connected.'))
      .catch(err => console.log('Database connection error: ${err.message}'));

var app = express();

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);
app.use(express.static('files'))

app.use(authRoutes);
app.use(uploadRoutes);
app.use(infoRoutes);

var dir = __dirname + '/LOG';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
var log_file = fs.createWriteStream(dir + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) {
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

const authCheck = function (req, res, next) {
    if (!req.user) {
        console.log("User not logged in. Redirecting...");
        res.redirect("/");
    } else {
        next();
    }
};

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/generic", authCheck, function(req, res) {
    res.render("generic");
});

app.listen(3000, 'localhost', function() {
    console.log("Server started.");
})

