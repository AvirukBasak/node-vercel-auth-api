const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../lib/mongoinit');

export default async function handler(req, res) {

  // check if the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method Not Allowed',
    });
  }

  // check if the request body is a json object
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  // check if the request body has the required fields
  if (!req.body?.username || !req.body?.email || !req.body?.password) {
    return res.status(400).json({
      message: 'Bad Request',
    });
  }

  // check if the username is already taken by querying the database

  // get username from mongodb
  let username, email;
  try {
    const data1 = await (await db()).collection('auth').findOne(
      { username: req.body.username },
      { projection: { username: 1, email: 1 } }
    );

    username = data1?.username;

    const data2 = await (await db()).collection('auth').findOne(
      { email: req.body.email },
      { projection: { username: 1, email: 1 } }
    );

    email = data2?.email;

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }

  // check if username is taken
  if (username) {
    return res.status(409).json({
      message: 'Username already taken',
    });
  }

  // check if email is taken
  if (email) {
    return res.status(409).json({
      message: 'Email already taken',
    });
  }

  // hash the password
  const hash = bcrypt.hashSync(req.body.password, 10);

  // create a new user
  const user = {
    username: req.body.username,
    hash,
    email: req.body.email,
    createdAt: new Date(),
    updatedAt: new Date(),
    token: [uuidv4()],
  };

  // insert the user into the database
  await (await db()).collection('auth').insertOne(user);

  // create a response object
  res.status(200).json({});
}
