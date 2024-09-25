const { Pool } = require('pg');

// Create a new Pool instance
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'books',
  password: '12345',
  port: 5432,
});

// Create the books table if it doesn't exist
const createBookTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      published_year INTEGER,
      isbn VARCHAR(13)
    )
  `;
  
  try {
    await pool.query(query);
    console.log('Books table created successfully');
  } catch (error) {
    console.error('Error creating books table:', error);
  }
};

// Create a new book
const createBook = async (book) => {
  const { title, author, published_year, isbn } = book;
  const query = 'INSERT INTO books (title, author, published_year, isbn) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [title, author, published_year, isbn];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

// Get all books
const getAllBooks = async () => {
  const query = 'SELECT * FROM books';

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting all books:', error);
    throw error;
  }
};

// Get book by ID
const getBookById = async (id) => {
  const query = 'SELECT * FROM books WHERE id = $1';
  const values = [id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting book by ID:', error);
    throw error;
  }
};

// Delete book by ID
const deleteBook = async (id) => {
  const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
  const values = [id];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

// Initialize the database
const initDatabase = async () => {
  await createBookTable();
};

module.exports = {
  initDatabase,
  createBook,
  getAllBooks,
  getBookById,
  deleteBook,
};