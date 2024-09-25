const http = require('http');
const url = require('url');
const {initDatabase, createBook, getBookById, deleteBook, getAllBooks} = require('./database');


initDatabase().then(() => {
  console.log('Database initialized');
}).catch((error) => {
  console.error('Failed to initialized database:', error);
});

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  const id = query.id;

  res.setHeader('Content-Type', 'application/json');

  if (pathname === '/book') {
    switch (req.method) {
      case 'GET':
        handleGet(res, id);
        break;
      case 'POST':
        handlePost(req, res);
        break;
      case 'PUT':
        handlePut(req, res, id);
        break;
      case 'PATCH':
        handlePatch(req, res, id);
        break;
      case 'DELETE':
        handleDelete(res, id);
        break;
      case 'OPTIONS':
        handleOptions(res);
        break;
      default:
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

function handleGet(res, id) {
  if (id) {
    getBookById(id).then((book) => {
      if (!book) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Book not found' }));
      } else {
        res.end(JSON.stringify(book));
      }
    }).catch((error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to fetch book', details: error.message }));
    });
  } else {
    getAllBooks().then((books) => {
      res.end(JSON.stringify(books));
    }).catch((error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to fetch books', details: error.message }));
    });
  }
}

function handlePost(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    const book = JSON.parse(body);
    const validateBook = validateBook(book);
    createBook(validateBook).then((newBook) =>{
      res.statusCode = 201;
      res.end(JSON.stringify(newBook));
    }).catch((error) =>{
      res.statusCode = 500;
      res.end(JSON.stringify({error: 'Failed to create book'}));
    });
  });
}

function handlePut(req, res, id) {
  if (!id) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Book ID is required' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk.toString());

  req.on('end', () => {
    const book = JSON.parse(body);
    const validatedBook = validateBook(book);

    getBookById(id).then((existingBook) => {
      if (!existingBook) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Book not found' }));
      } else {
        // Use the id for the update
        updateBook(id, validatedBook).then((updatedBook) => {
          res.end(JSON.stringify({ message: 'Book updated', book: updatedBook }));
        }).catch((error) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Failed to update book', details: error.message }));
        });
      }
    }).catch((error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to retrieve book', details: error.message }));
    });
  });
}

function handlePatch(req, res, id) {
  if (!id) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Book not found' }));
    return;
  }
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    const updates = JSON.parse(body);
    getBookById(id).then((exictingBook) => {
      if (!existingBook) {
        res.statusCode = 404;
        res.end(JSON.stringify({error: 'Book not found'}));
      }else{
        const updatedBook = { ...exictingBook, ...validateBook(updates)};
        createBook(updatedBook).then(() =>{
          res.end(JSON.stringify({message: 'Book updated'}));
        }).catch((error) => {
          res.statusCode = 500;
          res.end(JSON.stringify({error: 'Failed to update book'}));
        });
      }
    }).catch((error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({error: 'Failed to update book'}));
    });
    });
}

function handleDelete(res, id) {
  if (!id) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Book not found' }));
    return;
  }
  deleteBook(id).then((deleteBook) => {
    if (!deleteBook) {
      res.statusCode = 404;
      res.end(JSON.stringify({error: 'Book not found'}));
    }else {
      res.end(JSON.stringify({message: 'Book deleted'}));
    }
  }).catch((error) => {
    res.statusCode = 500;
    res.end(JSON.stringify({error: 'Failed to delete book'}));
  });
}
function handleOptions(res) {
  res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.end();
}

function validateBook(book) {
  const validFields = ['title', 'author', 'published_year', 'isbn'];
  return Object.fromEntries(
    Object.entries(book).filter(([key]) => validFields.includes(key))
  );
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
