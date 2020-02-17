const router                = require("express").Router(),
      keys                  = require("../config/keys"),
      bodyParser            = require("body-parser");
// router.use(bodyParser.json());
const fs                    = require("fs"),
      multer                = require('multer'),
      unzipper				= require('unzipper'),
      // csv                   = require('csv'),
      csv = require('csv-parser'),
      mongoose              = require("mongoose"),
      Grid                  = require('gridfs-stream'),
      GridFsStorage = require('multer-gridfs-storage'),
      {google}              = require('googleapis');

const busboy = require('connect-busboy');

router.use(busboy({
    highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
})); // Insert the busboy middle-ware

let gfs, bucket;
const conn = mongoose.createConnection(keys.mongo.mongoURI);
conn.once('open', function() {
    gfs = Grid(conn.db, mongoose.mongo);
    bucket = new mongoose.mongo.GridFSBucket(conn.db);
});

// storage engine for multer
const storage = new GridFsStorage({
    url: keys.mongo.mongoURI,
    file: function(req, file) {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            const fileInfo = {
                filename: filename,
                metadata: req.user.id,
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({storage: storage, limits:{
    fileSize: 10 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 }});
router.post("/upload/local", upload.single("localFileName"), function(req, res) {
    if (!req.file) {
        console.log("ERROR uploading local file.");
        res.send("Fail. Please try again.");
        return;
    }
    console.log(req.file);
    var prev_id = req.user.takeout1Id;
    req.user.takeout1Id = req.file.id;
    console.log("Uploading local file:" + req.file.id + " for " + req.user.username);

    var response = res;
    req.user.save(function(err, user) {
        if (err) {
            console.log("ERROR saving local file for user " + user._id + ": "); console.log(err);
            response.send("Fail. Please try again.");
        } else {
            console.log("File " + user.takeout1Id + " saved for user " + user._id);
            removeFile(prev_id, response, function () {});
            response.send("Success!");
        }
    });
})

router.post("/upload/drive", function(req, res) {
    var content = req.body;
    const oAuth2Client = new google.auth.OAuth2(
        keys.google.clientID,
        keys.google.clientSecret,
        "/auth/google/callback"
    );
    oAuth2Client.setCredentials(content.token);
    const drive = google.drive({version: 'v3', oAuth2Client});
    var fileId = content.docID, fileURL = content.docURL;

    console.log("Drive file selected: " + content.docName);
    var dest = bucket.openUploadStream(content.docName, {metadata: req.user.id});
    var user = req.user, response = res;
    drive.files.get({
        auth: oAuth2Client,
        fileId: fileId,
        alt: 'media',
        fields: '*',
    },  {responseType: 'stream'}, function(err, res) {
        if (err) {
            console.log("ERROR getting file from drive: "); console.log(err);
            response.send("Fail. Please try again.");
            return;
        }
        console.log("Uploading drive file.");
        res.data
        .on('end', function() {
            user.takeout1Id = dest.id;
            user.save(function(err, user) {
                if (err) {
                    console.log("ERROR saving drive file for user " + user._id + ": "); console.log(err);
                    response.send("Fail. Please try again.");
                } else {
                    console.log("File " + user.takeout1Id + " saved for user: " + user._id);
                    response.send("Success!");
                }
            });
        })
        .on('error', function(err) {
            console.log("ERROR uploading drive file: "); console.log(err);
            response.send("Fail. Please try again.");
        })
        .pipe(dest);
    });
});

var getCSVData = function(res) {
    const obj = csv();
    // is_intention,is_memory,id,title,url,tags,categoryId,category,time,description
    function MyCSV(Fone, Ftwo, Fthree, Ffour, Ffive, Fsix, Fseven, Feight, Fnine, Ften, ) {
        this.is_intention = Fone;
        this.is_memory = Ftwo;
        this.id = Fthree;
        this.title = Ffour;
        this.url = Ffive;
        this.tags = Fsix;
        this.categoryId = Fseven;
        this.category = Feight;
        this.time = Fnine;
        this.description = Ften;
    };
    var MyData = [];
    obj.from.path('./views/insight_report/w.csv').to.array(function (data) {
        for (var index = 0; index < data.length; index++) {
            // var cur = new MyCSV(data[index][0], data[index][1], data[index][2], data[index][3], data[index][4],data[index][5],data[index][6], data[index][7], data[index][8], data[index][9]);
            console.log(data[index]);
            var cur = {
                is_intention: data[index][0],
                is_memory: data[index][1],
                id: data[index][2],
                title: data[index][3],
                url: data[index][4],
                tags: data[index][5],
                categoryId: data[index][6],
                category: data[index][7],
                time: data[index][8],
                description: data[index][9],
            };
            console.log(cur);
            // MyData.push(cur);
            res.render("insight_report/visual", {"data": JSON.stringify(obj)});
            // res.render("insight_report/visual.html", {data: {
            //     "is_intention": data[index][0]
            // }});
            break;
        }
        // console.log(MyData);
        // res.render("insight_report/visual", {"data" : JSON.stringify(MyData)});
        // res.render("insight_report/visual.html", {data: MyData}); //JSON.stringify(MyData));
    });
}

var removeFile = function(takeout_id, res, next) {
    gfs.exist({_id: takeout_id}, function (err, found) {
        if (err) {
            console.log("ERROR finding takeout file metadata " + takeout_id + ": "); console.log(err);
        } else {
            if (found) {
                gfs.remove({_id: takeout_id}, function (err, gridStore) {
                    if (err) {
                        console.log("ERROR removing takeout file metadata " + takeout_id + ": "); console.log(err);
                        res.send("Fail. Please try again.");
                    } else {
                        console.log("File metadata " + takeout_id + " removed.");
                        next();
                    }
                });
            } else {
                next();
            }
        }
    });
}

var extractData = function(takeout_id, intentions, memories, res, next) {
    console.log(intentions);
    console.log(memories);
	gfs.files.find({_id: takeout_id}).toArray(function(err, files){
        if(!files || files.length === 0){
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        var readstream = gfs.createReadStream({
            filename: files[0].filename,
        });
		var stream = readstream.pipe(unzipper.Extract({ path: './views/insight_report/tmp_takeout' }));
		stream.on('finish', function () {
		    console.log("stream finish");
            var spawn = require("child_process").spawn;
            var pythonprocess = spawn('python3',[process.cwd() + "/views/insight_report/parsing.py", intentions, memories] );
            console.log(process.cwd());
            // pythonprocess.stderr.on('data', function(data) {
            //     console.log(data.toString());
            //     next();
            // });
            pythonprocess.stdout.on('data', function(data) {
                console.log("hi");
                console.log(data.toString('utf8'));
            })
            pythonprocess.on('exit', function() {
                next();
            })
		});

    });
}

router.get('/upload/report', function (req, res) {
    console.log("report_route");
    var id = req.user.id;
    var takeout_id = req.user.takeout1Id;
    // var data = {"color": client.favorite_color};
    var obj = {
        categoryId: 26,
        category: "Music"
    };

    // getCSVData(res);
    // res.render("insight_report/visual0");
    extractData(takeout_id, req.user.intentions, req.user.memories, res, function () {
        console.log("here");
        // res.render("/insight_report/visual.html");
        var results = [];
        fs.createReadStream('./views/insight_report/tmp.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // console.log(results);
            // [
            //   { NAME: 'Daffy Duck', AGE: '24' },
            //   { NAME: 'Bugs Bunny', AGE: '22' }
            // ]
            res.render("insight_report/visual", {"data" : JSON.stringify(results)});
        });
    });
});

router.get('/quit', function(req, res){
    var id = req.user.id;
    var takeout_id = req.user.takeout1Id;
    User.deleteOne({
        _id: id,
    }, function (err) {
        if (err) {
            console.log("ERROR removing user " + id + ": "); console.log(err);
            res.send("Fail. Please try again.");
        } else {
            removeFile(takeout_id, res, function () {
                console.log("User " + id + " removed.");
                req.user.remove(function(err) {
                    if (err) { console.error("ERROR removing user from req: "); console.log(err); }
                    return res.redirect('/');
                });
            });
        }
    });
});

router.get('/upload/secret', function(req, res){
    // gfs.collection('rec'); //set collection name to lookup into

    /** First check if file exists */
    gfs.files.find({_id: req.user.takeout1Id}).toArray(function(err, files){
        if(!files || files.length === 0){
            return res.status(404).json({
                responseCode: 1,
                responseMessage: "error"
            });
        }
        /** create read stream */
        var readstream = gfs.createReadStream({
            filename: files[0].filename,
            // root: "ctFiles"
        });
        var dest = fs.createWriteStream('./models/uploads/ttttest.zip');
        /** set the proper content type */
        // res.set('Content-Type', files[0].contentType)
        /** return response */
        return readstream.pipe(dest);
    });
});

module.exports = router;
