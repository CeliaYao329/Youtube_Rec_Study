const router               = require("express").Router(),
      passport             = require("passport"),
      {google}             = require('googleapis');

router.get('/auth/google', passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
    scope: ['profile', 'email'], //, 'https://www.googleapis.com/auth/drive.file']
}));

router.get('/auth/google/callback', passport.authenticate('google'), function(req, res) {
    res.redirect('/generic');
});

module.exports = router;
