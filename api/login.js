const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../lib/mongoinit');

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
  if (!req.body?.username || !req.body?.password) {
    return res.status(400).json({
      message: 'Bad Request'
    });
  }

  // check if the username exists in the database
  // if not, return 404
  // if yes, check if the password matches
  // if not, return 401

  // get username from mongodb
  let username, hash;
  try {
    const data = await (await db()).collection('auth').findOne(
      { username: req.body.username },
      { projection: { username: 1, hash: 1 } }
    );

    username = data?.username;
    hash = data?.hash;

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

  // check if password matches
  const passwordMatches = bcrypt.compareSync(req.body.password, hash);

  // if password does not match, return 401
  if (!passwordMatches) {
    return res.status(401).json({
      message: 'Incorrect password'
    });
  }

  // if password matches, return 200 with a random token from uuidv4

  // generate a random token
  const token = uuidv4();

  // insert token into mongodb
  await (await db()).collection('auth').updateOne({ username }, { '$push': { token } });

  // return 200 with the token
  return res.status(200).json({
    token
  });
}
