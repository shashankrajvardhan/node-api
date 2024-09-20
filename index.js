const http = require('http');
const url = require('url');

const books = new Map();

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
    const book = books.get(id);
    if (book) {
      res.end(JSON.stringify(book));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Book not found' }));
    }
  } else {
    res.end(JSON.stringify(Array.from(books.values())));
  }
}

function handlePost(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    const book = JSON.parse(body);
    const id = Date.now().toString();
    books.set(id, { id, ...validateBook(book) });
    res.statusCode = 201;
    res.end(JSON.stringify({ id }));
  });
}

function handlePut(req, res, id) {
  if (!id || !books.has(id)) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Book not found' }));
  }
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    const book = JSON.parse(body);
    books.set(id, { id, ...validateBook(book) });
    res.end(JSON.stringify({ message: 'Book updated' }));
  });
}

function handlePatch(req, res, id) {
  if (!id || !books.has(id)) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Book not found' }));
  }
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => {
    const updates = JSON.parse(body);
    const book = { ...books.get(id), ...validateBook(updates) };
    books.set(id, book);
    res.end(JSON.stringify({ message: 'Book updated' }));
  });
}

function handleDelete(res, id) {
  if (!id || !books.has(id)) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Book not found' }));
  }
  books.delete(id);
  res.end(JSON.stringify({ message: 'Book deleted' }));
}

function handleOptions(res) {
  res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.end();
}

function validateBook(book) {
  const validFields = ['title', 'author', 'year', 'genre'];
  return Object.fromEntries(
    Object.entries(book).filter(([key]) => validFields.includes(key))
  );
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
