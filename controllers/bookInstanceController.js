const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find()
    .populate('book')
    .sort({'book.title': 1})
    .exec();

  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();

  if (bookInstance === null) {
    const err = new Error('Book instance not found');
    err.status = 404;
    return next(err);
  }
  res.render('bookinstance_detail', {
    title: 'Book:',
    bookInstance
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, 'title').exec();

  res.render('bookinstance_form', {
    title: 'Create Book Instance',
    book_list: allBooks,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().notEmpty().escape(),
  body('imprint', 'Imprint must be specified').trim().notEmpty().escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ values: 'falsy' }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, 'title').exec();

      res.render('bookinstance_form', {
        title: 'Create Book Instance',
        book_list: allBooks,
        errors: errors.array(),
        selected_book: bookInstance.book._id,
        bookInstance,
      });
    } else {
      // Data from form is valid
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  // Get information of the book instace
  const bookInstance = await BookInstance.findById(req.params.id);

  if (bookInstance === null) {
    // The book instance is already deleted
    res.redirect('catalog/bookinstances');
  } else {
    res.render('bookinstance_delete', {
      title: 'Book Instance Delete',
      book_instance: bookInstance,
    });
  }
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.params.id);
  res.redirect('/catalog/bookinstances');
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  // Get information from book instance and all books
  const [bookInstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).populate('book').exec(),
    Book.find({}, 'title').exec(),
  ]);

  if (bookInstance == null) {
    // bookInstance not found send 404 error
    const err = new Error('Book Instance not found');
    res.status = 404;
    return next(err);
  }

  res.render('bookinstance_form', {
    title: 'Update book instance',
    selected_book: bookInstance.book._id,
    book_list: allBooks,
    bookInstance,
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().notEmpty().escape(),
  body('imprint', 'Imprint must be specified').trim().notEmpty().escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ values: 'falsy' }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Update BookInstance object with escaped and trimmed data and old id.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      const allBooks = await Book.find({}, 'title').exec();

      res.render('bookinstance_form', {
        title: 'Create Book Instance',
        book_list: allBooks,
        errors: errors.array(),
        selected_book: bookInstance.book._id,
        bookInstance,
      });
    } else {
      // Data from form is valid
      const theBookInstance = await BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {});
      res.redirect(theBookInstance.url);
    }
  }),
];
