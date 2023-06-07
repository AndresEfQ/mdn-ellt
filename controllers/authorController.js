const Author = require('../models/author');
const Book = require('../models/book');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all Authors
exports.author_list = asyncHandler(async(req, res, next) => {
  const allAuthors = await Author.find().exec();
  res.render('author_list', {title: 'Author List', author_list: allAuthors});
});

// Display detail page for a sepecific Auhor.
exports.author_detail = asyncHandler(async(req, res, next) => {
  const [author, booksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, 'title summary').exec(),
  ]);

  if (author === null) {
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }
  res.render('author_detail', {
    title: 'Author Detail',
    author,
    booksByAuthor,
  });
});

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render('author_form', { title: 'Create Author' })
};

// Handle Author create on POST.
exports.author_create_post = [
  
  body('first_name')
    .trim()
    .notEmpty()
    .escape()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters'),

  body('family_name')
    .trim()
    .notEmpty()
    .escape()
    .withMessage('Family name must be specified')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters'),

  body('date_of_birth', 'Invalid date of birth')
    .optional( {values: 'falsy' })
    .isISO8601()
    .toDate(),
  
  body('date_of_death', 'Invalid date of death')
    .optional( {values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process requests after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from the request
    const errors = validationResult(req);

    console.log(req.body.date_of_birth);

    // Create Author object with escaped and trimmed data.
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values / errors messages.
      res.render('author_form', { 
        title: 'Create Author',
        errors: errors.array(),
        author,
      });
      return;
    } else {
      // Data form is valid

      // Save author
      await author.save();
      // Redirect to new author record
      res.redirect(author.url);
    }
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async(req, res, next) => {
  res.send('NOT IMPLEMENTED: Author delete GET')
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async(req, res, next) => {
  res.send('NOT IMPLEMENTED: Author delete POST')
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update GET');
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Author update POST');
});
