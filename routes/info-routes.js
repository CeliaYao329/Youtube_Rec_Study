const router                = require("express").Router(),
      keys                  = require("../config/keys"),
      mongoose              = require("mongoose");
const busboyBodyParser = require('busboy-body-parser');
router.use(busboyBodyParser());

router.post("/upload/info", function (req, res) {
    req.user.preferredName = req.body.preferredName;
    req.user.like = req.body.like;
    req.user.dislike = req.body.dislike;
    req.user.visitFrequency = req.body.visitFrequency;
    req.user.timeSlots = JSON.parse(req.body.timeSlots).timeSlots;
    req.user.feelAboutYoutubeRec = req.body.feelAboutYoutubeRec;
    req.user.recWatchFrequency = req.body.recWatchFrequency;
    req.user.purposes = JSON.parse(req.body.purposes).purposes;
    req.user.dates = JSON.parse(req.body.dates).dates;
    req.user.timezone = req.body.timezone;
    req.user.occupation = req.body.occupation;
    req.user.politicalAttitude = req.body.politicalAttitude;
    req.user.takeout1ID = mongoose.Schema.Types.ObjectId("");
    req.user.takeout2ID = mongoose.Schema.Types.ObjectId("");

    console.log(req.user.like);
    console.log(req.user.dislike);
    req.user.save(function(err, user) {
        if (err) { console.log("ERROR saving user info: "); console.log(err); }
        else console.log("User info saved: " + req.user._id);
    });
});

router.post("/upload/intention", function(req, res) {
    req.user.intentions = JSON.parse(req.body.intentions).intentions;
    req.user.save(function(err, user) {
        if (err) { console.log("ERROR saving user intention: "); console.log(err); }
        else console.log("User intention saved: " + req.user._id);
    });
});

router.post("/upload/memory", function(req, res) {
    req.user.memories = JSON.parse(req.body.memories).memories;
    req.user.save(function(err, user) {
        if (err) { console.log("ERROR saving user memory: "); console.log(err); }
        else console.log("User memory saved: " + req.user._id);
    });
});

router.post("/upload/email", function(req, res) {
    sendConfirmEmail(req.user.preferredName, req.user.email, function() {
        console.log("Finish onboarding process for user: " + req.user._id + "\n " + req.user);
    });
});

var sendConfirmEmail = function(name, email, next) {
    if (typeof name === "undefined" || typeof email === "undefined") {
        console.log("ERROR sending confirmation email: no user name or email");
        return;
    }
    console.log("Sending confirmation email to " + name);
    var aws = require('aws-sdk');
        // Provide the full path to your config.json file.
        aws.config.loadFromPath("./config/config.json");
        aws.config.update({
            region: "us-west-2"
        });

        // Replace sender@example.com with your "From" address.
        // This address must be verified with Amazon SES.
        const sender = "SDL Rec Study <sdlrec-cornelltech@outlook.com>";

        // Replace recipient@example.com with a "To" address. If your account
        // is still in the sandbox, this address must be verified.
        const recipient = email;
        const recipient_tag = recipient.replace(/[^0-9a-z]/gi, '')

        // Specify a configuration set. If you do not want to use a configuration
        // set, comment the following variable, and the
        // ConfigurationSetName : configuration_set argument below.
        // const configuration_set = "ConfigSet";

        // The subject line for the email.
        const subject = "Thanks for participaring study of intention-aware video recommendation";

        // The HTML body of the email.
        const body_html = `<!doctype html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>LiveIntent Template</title>
</head>
<body marginwidth="0" style="font-family:Verdana, Geneva, sans-serif;" marginheight="0" topmargin="0" leftmargin="0">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center">
    <tr>
      <td width="100%" valign="top" bgcolor="" style="padding-top:20px;">
        <!-- START INNER MAIN CONTAINER -->
        <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="deviceWidth" style="margin:0 auto;">
          
          <tr>
            <td width="600" style="vertical-align:middle;" valign="middle" height="60" class="center deviceWidth">
                <table width="600" style="background-repeat: repeat;text-align: center;color: #000000;vertical-align:middle;" valign="middle" height="60" class="center deviceWidth">
                  <tr>
                    <td valign="middle" height="60">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td align="left" valign="top">
                                             <font size="4.5"><b>SDL-REC</b> <font color="#777777">Study of intention-aware video recommendation </font></font>
                                             <hr color="#dddddd">
                                          </td>
                                      </tr>
                                  </table>
                    </td>
                  </tr>
                </table>
            </td>
          </tr>
          
        </table>
        
        <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="deviceWidth" style="margin:0 auto;">
          <tr>
            <td>
              <p style="mso-table-lspace:0;mso-table-rspace:0;margin:0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left">
                  <tr>
                    <td style="padding:0px;">
                      <h3><font color="#004D7F">Thanks for your participation!</font></h3> 
                      <p><font size="2.5"> The study of intention-aware video recommendation is led by <a href="https://smalldata.io/">the Small Data Lab</a> at Cornell University. We are very excited to have you as our participant! You have finished the onboarding process, and we would like to go through the most important things again.</font></p>

                      <h4><font color="#004D7F">In the coming 2 months</font></h4>
                      <p><font size="2.5">You will receive emails from us regularly. Each email has 5 videos we recommend for you based on the survey you completed. Please check out the emails!</font></p>

                      <h4><font color="#004D7F">After 2 months</font></h4>
                      <p><font size="2.5">At the end of the study, you will need to share your YouTube watch history with us in order to access videos you watched during our study and to evaluate the effectiveness of our recommendation system. We will provide a detailed instruction of how to do that safely and quickly. 
                      <b>Again, all of your data will only be used for this study, and will be de-identified and anonymized before any analysis. The raw data will be deleted after the study.</b></font></p>
                    
                      <h4><font color="#004D7F">What you get</font></h4>
                      <p><font size="2.5">At the end, if you succesfully upload your YouTube watch history, we will provide you an insight report of your video consumption. And based on how many emails you have opened, <b>you might have the chance to get $50 Amazon gift card!
                      The more emails you open, the higher chance that you will get the reward!</b></font></p>

                      <h4>Contacts</h4>
                      <font size="2.5">If you have any questions or concerns, you can always contact <a href="mailto:https://smalldata.io">Siyu Yao</a> and <a href="mailto:yw2224@cornell.edu">Yixue Wang</a></font>

                    </td>
                  </tr>
                </table>
              </p>
              
            </td>
            <tr>
              <td style="line-height: 20px;font-size:20px;" height="20">&nbsp;
              </td>
            </tr>
          </tr>
        </table>



        <table width="600" border="0" cellpadding="0" cellspacing="0" align="center" class="deviceWidth" style="margin:0 auto;">
          <tr>
            <td style="line-height: 20px;font-size:20px;" height="20">&nbsp;</td>
          </tr>
          <tr>
            <td>
              <table bgcolor="#D6D5D5" border="0" cellpadding="10" cellspacing="0" width="100%" id="emailFooter">
                            <tr>
                                <td align="center" valign="bottom">
                                    <a href="https://smalldata.io"><font size="3" color="#004D7F">Small Data Lab @ Cornell Tech</font></a>
                                </td>
                            </tr>
                            <tr>
                              <td align="center" valign="middle">
                                <font size="2" color="#004D7F">Siyu Yao (sy684@cornell.edu)  Yixue Wang (yw2224@cornell.edu)</font>
                              </td>
                            </tr>
                        </table>
            </td>
          </tr>
          <tr>
            <td style="line-height: 20px;font-size:20px;" height="20">&nbsp;</td>
          </tr>
        </table>

        <!-- END INNER MAIN CONTAINER -->
      </td>
    </tr>
  </table>
<div style="display:none;white-space:nowrap;font:15px courier;color:#ffffff;">
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
</div>
</body>
</html>`;

        // The character encoding for the email.
        const charset = "UTF-8";
	const body = "test";
        // Create a new SES object.
        var ses = new aws.SES();

    // Specify the parameters to pass to the API.
    var params = {
        Source: sender,
        Destination: {
            ToAddresses: [
                recipient
            ],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: charset
            },
            Body: {
                Html: {
                    Data: body_html,
                    Charset: charset
                },
            },
        },
        Tags: [
            {
                Name: 'Stage',
                Value: 'onboarding'
            },
            {
                Name: 'Recipient',
                Value: recipient_tag
            }
        ],
        ConfigurationSetName: 'emails',
        };

        //Try to send the email.
        ses.sendEmail(params, function(err, data) {
            // If something goes wrong, print an error message.
            if (err) {
                console.log("ERROR sending onboarding email: ", err.message);
                return;
            } else {
                console.log("Email sent. Message ID: ", data.MessageId);
                next();
            }
        });
}

module.exports = router;
