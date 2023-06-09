const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances, authors and genre counts (in parallel)
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({status: 'Available'}).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  res.render('index', {
    title: 'Local Library Home',
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, 'title author')
    .sort({ title: 1 })
    .populate('author')
    .exec();

  res.render('book_list', { title: 'Book list', book_list: allBooks});
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  // Get details of books, book instances for specific book
  const [book, bookInstances] = await Promise.all([
    Book.findById(req.params.id).populate('author').populate('genre').exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);
  if (book === null) {
    // No results.
    const err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }
  res.render('book_detail', {
    title: book.title,
    book,
    bookInstances,
  });
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [authors, genres] = await Promise.all([
    Author.find().exec(),
    Genre.find().exec(),
  ]);

  res.render('book_form', {
    title: 'Create Book',
    authors,
    genres,
  });
});

// Handle book create on POST.
exports.book_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitize fields
  body('title', 'Title must not be empty.')
    .trim()
    .notEmpty()
    .escape(),

  body('author', 'Author must not be empty.')
    .trim()
    .notEmpty()
    .escape(),

  body('summary', 'Summary must not be empty')
    .trim()
    .notEmpty()
    .escape(),

  body('isbn', 'ISBN must not be empty')
    .trim()
    .notEmpty()
    .escape(),

  body('genre.*').escape(),

  // Process request after validation and sanitization.
  asyncHandler(async(req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      const [authors, genres] = await Promise.all([
        Author.find().exec(),
        Genre.find().exec(),
      ]);

      // Mark selected genres as checked.
      for (const genre of genres) {
        if (book.genre.indexOf(genre._id) > -1) {
          genre.checked = 'true';
        }
      }
      
      res.render('book_form', {
        title: 'Create Book',
        errors: errors.array(),
        authors,
        genres,
        book,
      });
    } else {
      // Data form is valid, save book.
      await book.save();
      res.redirect(book.url);
    }
  }),
]

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book update GET');
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Book update POST');
});
