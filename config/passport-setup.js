const passport              = require("passport"),
      keys                  = require("./keys"),
      GoogleStrategy        = require( 'passport-google-oauth2' ).Strategy,
      User                  = require("../models/user");

// to cookie
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// from cookie
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        done(null, user);
    });
})

passport.use(new GoogleStrategy({
    clientID:     keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: "/auth/google/callback",
}, function(request, accessToken, refreshToken, profile, done) {
    User.findOne({googleId: profile.id}, function(err, user) {
        if (user) {
            console.log("Exiting user: " + user._id);
            done(null, user);
        } else {
            user = new User({
                username: profile.displayName,
                googleId: profile.id,
                email: profile.email,
            });
            user.save(function(err, user) {
                if (err) { console.log("ERROR registering user: " + user._id); console.log(err); }
                console.log("New user registered: " + user._id);
                return done(err, user);
            });
        }
    });
}));

passport.use('google-drive', new GoogleStrategy({
    clientID:     keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: "/auth/drive/callback",
}, function(request, accessToken, refreshToken, profile, done) {
    done(null, refreshToken);
}));
