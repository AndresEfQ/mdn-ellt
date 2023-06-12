const Genre = require('../models/genre');
const Book = require('../models/book');

const asyncHandler = require('express-async-handler');

const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ 'name': 1}).exec();
  res.render('genre_list', {title: 'Genre List', genre_list: allGenres});
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books in parallel
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);
  if (genre === null) {
    // No results
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }
  res.render('genre_detail', {
    title: 'Genre Detail',
    genre_books: booksInGenre,
    genre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', {
    title: 'Create Genre'
  });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Genre must contain at least 3 characteres')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async(req, res, next) => {
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data
    const genre = new Genre({ name:req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render('genre_form', {
        title: "Create Genre",
        errors: errors.array(),
        genre,
      });
      return;
    } else {
      // Data form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of genre and all the books with that genre
  const [genre, allBooksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);

  if (genre === null) {
    res.redirect('/catalog/genres');
  }

  res.render('genre_delete', {
    title: 'Delete Genre',
    genre: genre,
    genre_books: allBooksWithGenre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, allBooksWithGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, 'title summary').exec(),
  ]);

  if (allBooksWithGenre.length > 0) {
    // There are books with the genre. Render in the same way as fo GET route.
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: genre,
      genre_books: allBooksWithGenre,
    });
  } else {
    // There are no books with the genre. Delete object and redirect to the list of genres.
    await Genre.findByIdAndDelete(req.params.id);
    res.redirect('/catalog/genres');
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre == null) {
    // genre not found send 404 error
    const err = new Error('Genre not found');
    res.status = 404;
    return next(err);
  } 
  
  res.render('genre_form', {title: 'Update Genre', genre});
  
});

// Handle Genre update on POST.
exports.genre_update_post = [
  body('name', 'Genre must contain at least 3 characteres')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  
  asyncHandler(async(req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Update genre object with escaped and trimmed data and old id.
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });


    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again with sanitized values and error messages.
      res.render('genre_form', {
        title: 'Update Genre',
        errors: errors.array(),
        genre,
      });
    } else {
      // Data form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        const thegenre = await Genre.findByIdAndUpdate(req.params.id, genre, {});
        res.redirect(thegenre.url);
      }
    }
  }),
];
