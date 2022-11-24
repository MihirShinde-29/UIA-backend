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
const area = 2.1
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
            console.log(dir);
            var final_img = {
                contentType: req.file.mimetype,
                data: fs.readFileSync(dir)
            };
            req.body.image = final_img
            req.body.imageURL = req.file.destination + '/' + req.file.filename
            req.body.date = new Date()
            req.body.status = 'Pending'
            const newReport = new Report(req.body);
            newReport.save()
                .then(() => res.json('Report added!'))
                .catch(err => res.status(400).json('Error: ' + err));
        }
    })
})

router.get('/report', (req, res) => {
    Report.find()
        .select('-image')
        .then(reports => res.json(reports))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.post('/area-wise-report', (req, res) => {
    const { latitude, longitude } = req.body;
    const radius = req.body.area || area;
    Report.find({ latitude: {$gt: parseInt(latitude) - radius, $lt: parseInt(latitude) + radius}, longitude: {$gt: parseInt(longitude) - radius, $lt: parseInt(longitude) + radius }})
        .select('-image')
        .then(reports => res.json({result: reports, area: radius, total: reports.length}))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.get('/', (req, res) => {
    res.json({ message: { msgBody: "backend working", msgError: false } });
});

router.patch('/report/:id', (req, res) => {
    Report.findById(req.params.id)
        .then(report => {
            report.status = req.body.status;
            report.save()
                .then(() => res.json('Report updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use(router)
app.listen(port, () => console.log(`Example app listening on port ${port}! - http://localhost:${port}`));