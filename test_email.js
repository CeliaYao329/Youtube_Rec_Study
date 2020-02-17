sendConfirmEmail = function(name, email, next) {
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
	const body_html = `<!doctype html>`;

	const charset = "UTF-8";

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

//    //Try to send the email.
//    ses.sendEmail(params, function(err, data) {
//        // If something goes wrong, print an error message.
//        if (err) {
//            console.log("ERROR sending onboarding email: ", err.message);
//            return;
//        } else {
//            console.log("Email sent. Message ID: ", data.MessageId);
//            next();
//        }
//    });
}

sendConfirmEmail("yix", "xmyiwz@gmail.com", function() {
	console.log("Finish onboarding process for user: " + req.user._id + "\n " + req.user);
});
