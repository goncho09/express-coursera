import { Router } from 'express';
import books from './booksdb.js';
import { userExists, users } from './auth_users.js';

const public_users = Router();

const getBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

public_users.get('/', async function (req, res) {
  try {
    const booksToShow = await getBooks();
    res.status(200).send(JSON.stringify(booksToShow));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

public_users.get('/isbn/:isbn', function (req, res) {
  try {
    new Promise((resolve, reject) => {
      const isbn = parseInt(req.params.isbn);
      const book = books[isbn];
      if (book == undefined) {
        reject({ status: 404, message: 'Book not found.' });
      } else {
        resolve(book);
      }
    }).then(
      (result) => res.status(200).send(result),
      (error) => res.status(error.status).json({ message: error.message })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

public_users.get('/author/:author', function (req, res) {
  try {
    const author = req.params.author;
    const authorBooks = Object.values(books).filter(
      (book) => book.author === author
    );
    return res.status(200).send(authorBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

public_users.get('/title/:title', function (req, res) {
  try {
    const title = req.params.title;
    const book = Object.values(books).filter((book) => book.title === title);
    return res.status(200).send(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  try {
    const isbn = parseInt(req.params.isbn);
    const book = books[isbn];
    if (book == undefined)
      return res.status(404).json({ message: 'Book not found.' });
    return res.status(200).send(book.reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

public_users.post('/register', function (req, res) {
  try {
    const { username, password } = req.body;
    if (username && password) {
      if (userExists(username))
        return res.status(409).json({ message: 'The user already exists.' });
      users.push({ username: username, password: password });
      return res.status(201).json({ message: 'The user was created.' });
    }
    return res
      .status(404)
      .json({ message: 'You need to enter a username and password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default public_users;
