

const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

connectDB();

const referSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobileNo: { type: Number, required: true },
    course: { type: String, required: true },
});
const referModel = mongoose.model('referral', referSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.post('/referrals', async (req, res) => {
    try {
        const { name, email, mobileNo, course } = req.body;
        if (!name || !email || !mobileNo || !course) {
            return res.send({ error: 'All fields are required' });
        }
        const referData = new referModel({ name, email, mobileNo, course });
        await referData.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Referral Submitted Successfully',
            text: `Dear ${name},\n\nThank you for your referral. We have received your submission successfully.\n\nCourse: ${course}\n\nBest regards,\nAccredian`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Email sent: ' + info.response);
        });

        res.status(201).send({
            success: true,
            message: 'Referral saved successfully',
        });

    } catch (err) {
        res.status(500).send({
            success: false,
            error: 'Internal server error',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
