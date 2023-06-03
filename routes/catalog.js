const express = require('express');
const router = express.Router();

//Require contrller modules.
const book_controller = require('../controllers/bookController');
const author_controller = require('../controllers/authorController');
const genre_controller = require('../controllers/genreController');
const book_instance_controller = require('../controllers/bookInstanceController');

/// BOOK ROUTES ///

// Get catalog home page
router.get('/', book_controller.index);

// GET request for creating a Book. NOTE this must come before routes that display Book (uses id).
router.get('/book/create', book_controller.book_create_get);

// POST request for creating Book
router.post('/book/create', book_controller.book_create_post);

// GET request 