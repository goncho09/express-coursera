import express from 'express';
import jwt from 'jsonwebtoken';
import session from 'express-session';

import general_routes from './routes/general.js';
import customer_routes from './routes/auth_users.js';

const PORT = 5000;
const app = express();
// The JWT SECRET should be saved in an environment variable
export const JWT_SECRET = 'dsadasd';

app.use(express.json());

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true,
  })
);

app.use('/customer/auth/*', function auth(req, res, next) {
  let token = req.headers['authorization'];
  if (token == null)
    return res.status(401).json({ message: 'You need a token.' });
  token = token.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'User not authenticated.' });
    req.user = user;
    next();
  });
});

app.use('/customer', customer_routes);
app.use('/', general_routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
