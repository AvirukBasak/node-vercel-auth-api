const bcrypt = require('bcryptjs');

const { db } = require('../lib/mongoinit.js');

export default async function handler(req, res) {

  // check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method Not Allowed'
    });
  }

  // check if the request body is a json object
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      message: 'Bad Request'
    });
  }

  // check if the request body has the required fields
  if (!req.body?.username || !req.body?.email || !req.body?.otp || !req.body?.password) {
    return res.status(400).json({
      message: 'Bad Request'
    });
  }

  // check if the username and email exists in the database

  // get username and email from mongodb
  let username, email, otpNow;
  try {
    const data = await (await db()).collection('auth').findOne(
      { username: req.body.username, email: req.body.email },
      { projection: { username: 1, email: 1, otpNow: 1 } }
    );

    username = data?.username;
    email = data?.email;
    otpNow = data?.otpNow;

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

  // check if otpNow exists
  if (!otpNow) {
    return res.status(404).json({
      message: 'Password reset was not requested'
    });
  }

  // check if otp is expired
  if (new Date() > otpNow.expiresAt) {
    return res.status(401).json({
      message: 'OTP expired'
    });
  }

  // if otp does not match, return 401
  if (!otpNow.otp === req.body.otp) {
    return res.status(401).json({
      message: 'Incorrect OTP or OTP expired'
    });
  }

  // hash the password
  const hash = bcrypt.hashSync(req.body.password, 10);

  // update the user's password
  await (await db()).collection('auth').updateOne({ username }, { $set: { hash } });

  // set user updatedAt
  await (await db()).collection('auth').updateOne({ username }, { $set: { updatedAt: new Date() } });

  // delete the otpNow
  await (await db()).collection('auth').updateOne({ username }, { $unset: { otpNow: '' } });

  // return 200
  return res.status(200).json({
    message: 'Password reset successfully'
  });
}
