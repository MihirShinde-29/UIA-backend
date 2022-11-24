const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const User = require('./userModel');
const upload = require('./upload');
const Report = require('./reportModel');
const app = express();
const port = 4000;
dotenv.config();
const URI = process.env.MONGO_URI;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(bodyParser.json());
const connectDB = () => {
    mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));
}
connectDB();

router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err) {
            res.status(500).json({ message: { msgBody: "Error has occured", msgError: true } });
        }
        if (user) {
            res.status(400).json({ message: { msgBody: "Username is already taken", msgError: true } });
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
                const newUser = new User({
                    email,
                    password: hash
                });
                newUser.save()
                    .then(() => res.json('User added!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            });
        }
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
                            res.status(200).json({ token, user: { email: user.email } });
                        } else {
                            res.status(400).json({ message: { msgBody: "Username or password is incorrect", msgError: true } });
                        }
                    })
                } else {
                    res.status(400).json({ message: { msgBody: "Username or password is incorrect", msgError: true } });
                }
            })
});

router.post('/report', (req, res) => {
    upload(req, res, async (err) => {
        console.log(req.file);
        if (err) {
            res.status(500).send({
                success: false,
                message: err,
            });
        } else {
            let dir = __dirname.split('\\').join('/') + '/uploads/' + req.file.filename
            // dir = dir.replace(/(\s+)/g, '\\$1');
            console.log(dir);
            var final_img = {
                contentType: req.file.mimetype,
                data: fs.readFileSync(dir)
            };
            req.body.image = final_img
            req.body.imageURL = req.file.destination + '/' + req.file.filename
            req.body.date = new Date()
            const newReport = new Report(req.body);
            newReport.save()
                .then(() => res.json('Report added!'))
                .catch(err => res.status(400).json('Error: ' + err));
        }
    })
})

router.get('/report', (req, res) => {
    if(req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(500).json({ authenticated: false, message: { msgBody: "Unauthorized", msgError: true } });
            } else {
                Report.find()
                    .select('-image')
                    .then(reports => res.json(reports))
                    .catch(err => res.status(400).json('Error: ' + err));
            }
        })
    } else {
        res.status(500).json({ authenticated: false, message: { msgBody: "Unauthorized", msgError: true } });
    }
});

router.get('/', (req, res) => {
    res.json({ message: { msgBody: "Successfully logged in", msgError: false } });
});
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use(router)
app.listen(port, () => console.log(`Example app listening on port ${port}! - http://localhost:${port}`));