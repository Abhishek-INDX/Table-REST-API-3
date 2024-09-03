const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser'); 

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json()); 

app.get('/books', async (req, res) => {
    let { page, limit } = req.query;

    page = page ? parseInt(page, 10) : 1;
    limit = limit ? parseInt(limit, 10) : 10;

    page = Math.max(page, 1);
    limit = Math.max(limit, 1);

    try {
        const filePath = path.join(__dirname, 'data.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (!Array.isArray(data.results)) {
            throw new Error('Invalid data format: "results" key is missing or not an array.');
        }

        const books = data.results;
        const totalBooks = books.length;
        const totalPages = Math.ceil(totalBooks / limit);

        page = Math.min(Math.max(page, 1), totalPages);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalBooks);

        const paginatedBooks = books.slice(startIndex, endIndex);

        res.json({
            page,
            limit,
            totalBooks,
            totalPages,
            books: paginatedBooks
        });
    } catch (error) {
        console.error('Error fetching books data:', error);
        res.status(500).json({ error: 'An error occurred while fetching books data.' });
    }
});

app.post('/books', (req, res) => {
    try {
        const newBook = req.body;
        const filePath = path.join(__dirname, 'data.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (!Array.isArray(data.results)) {
            throw new Error('Invalid data format: "results" key is missing or not an array.');
        }

        // Add new book to the data
        data.results.push(newBook);

        // Write updated data back to the file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        res.status(201).json({ message: 'Book added successfully!' });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'An error occurred while adding the book.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});