const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

const { db } = require('../lib/mongoinit');

export default async function handler(req, res) {

  // make sure the required environment variables are set
  if (!process.env.EMAIL_ADDRESS) throw new Error("Add 'EMAIL_ADDRESS' to environment variables");
  if (!process.env.EMAIL_PASSWORD) throw new Error("Add 'EMAIL_PASSWORD' to environment variables");

  // check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method Not Allowed'
    });
  }

  // check if the request body is a JSON object
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      message: 'Bad Request'
    });
  }

  // check if the request body has the required fields
  if (!req.body?.username || !req.body?.email) {
    return res.status(400).json({
      message: 'Bad Request'
    });
  }

  // check if the username and email exist in the database

  // get username and email from MongoDB
  let username, email;
  try {
    const data = await (await db()).collection('auth').findOne(
      { username: req.body.username, email: req.body.email },
      { projection: { username: 1, email: 1 } }
    );

    username = data?.username;
    email = data?.email;

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }

  // check if username exists
  if (!username) {
    return res.status(404).json({
      message: 'User not found'
    });
  }

  // generate a random 8-digit crypto number
  const secret = speakeasy.generateSecret({ length: 20 });
  const code = speakeasy.totp({ secret: secret.base32, encoding: 'base32' });

  // store the code in the database
  try {
    await (await db()).collection('auth').updateOne({ username }, {
      $set: {
        otpNow: {
          otp: code,
          // expire after 5 +1 minutes from now, time in milliseconds
          expiresAt: new Date(Date.now() + (5 + 1) * 60 * 1000)
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }

  // send the code to the user's email
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Your verification code',
    text: `Your verification code is ${code}. This code will expire in 5 minutes.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error", error });
    } else {
      console.log(info.envelope);
      console.log(info.messageId);
      return res.status(200).json({
        message: `Verification code sent to '${email}'`
      });
    }
  });

}
