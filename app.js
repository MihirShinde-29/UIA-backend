const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const User = require('./userModel');
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

router.get('/', (req, res) => {
    res.json({ message: { msgBody: "Successfully logged in", msgError: false } });
});
app.use(router)
app.listen(port, () => console.log(`Example app listening on port ${port}! - http://localhost:${port}`));