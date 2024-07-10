import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../index.js';
import books from './booksdb.js';

const router = Router();
export const users = [];

export const userExists = (username) => {
  const userExist = users.find((user) => user.username === username);
  return userExist;
};

router.post('/login', function (req, res) {
  const { username, password } = req.body;
  const userRegistered = users.find(
    (user) => user.username === username && user.password === password
  );
  if (!userRegistered)
    return res.status(401).json({ message: 'User not found' });
  let token = jwt.sign({ username: username, password: password }, JWT_SECRET, {
    expiresIn: '1h',
  });
  req.session.token = { token, username };
  res.status(200).json({ message: 'User logged in', token });
});

router.put('/auth/review/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  if (book == undefined)
    return res.status(404).json({ message: 'Book not found.' });

  const { rating, comment } = req.body;
  const reviewer = req.session.token ? req.session.token.username : 'Unknown';
  if (!rating || !comment)
    return res.status(400).json({
      message: 'You need to fill all fields (rating and comment).',
    });
  book.reviews[`review${Object.keys(book.reviews).length + 1}`] = {
    reviewer,
    rating,
    comment,
  };
  res.status(201).json({ message: 'Review created.' });
});

router.delete('/auth/review/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);
  const book = books[isbn];
  if (book == undefined)
    return res.status(404).json({ message: 'Book not found.' });

  const { reviewId } = req.body;
  if (!reviewId)
    return res
      .status(400)
      .json({ message: 'You need to enter a review ID (reviewId).' });
  if (!book.reviews[`review${reviewId}`])
    return res.status(404).json({ message: 'Review not found.' });
  delete book.reviews[`review${reviewId}`];
  res.status(200).json({ message: 'Review deleted.' });
});

export default router;
