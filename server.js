// Import required modules
const express = require('express');
const cors = require('cors');
const fs = require('fs');

function createDatabase(req,res,next){
const filePath = './database.json';

// Check if the file exists
if (!fs.existsSync(filePath)) {
  // Create a new file with content {"arr": []}
  const initialContent = JSON.stringify({ arr: [] }, null, 2);

  fs.writeFile(filePath, initialContent, (err) => {
    if (err) {
      console.error('Error creating the file:', err);
      res.end()
    } else {
      console.log('File created successfully with content:', initialContent);
      next()
    }
  });
} else {
  console.log('File already exists.');
  next()
}
}


// Create an instance of express
const app = express();

// Set the port number
const PORT = process.env.PORT || 4000;

// Middleware to enable CORS for all requests
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());



// Define a simple GET route
app.get('/', createDatabase,(req, res) => {
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err) {
          console.log('Error reading the file:', err);
          return res.end();
        }
        
        // Parse JSON string into JavaScript object
        try {
          const database = JSON.parse(data);
          res.json(database)
        } catch (parseErr) {
          res.end();
        }
      });
});

// Define a POST route that echoes back the JSON data
app.post('/quote',createDatabase, (req, res) => {
   

    const newQuote = req.body;

    // Check if the incoming data matches the schema
    if (!newQuote.author|| !newQuote.title || !newQuote.content) {
      return res.status(400).json({ message: 'Invalid quote schema' });
    }
  
    // Read the existing database.json file
    fs.readFile('database.json', 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Error reading the database file' });
      }
  
      // Parse the file content to an object
      let database;
      try {
        database = JSON.parse(data);
      } catch (parseErr) {
        return res.status(500).json({ message: 'Error parsing JSON data' });
      }
  
      // Append the new quote to the `arr` array
      database.arr.push(newQuote);
  
      // Write the updated database back to database.json
      fs.writeFile('database.json', JSON.stringify(database, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
          return res.status(500).json({ message: 'Error writing to the database file' });
        }
  
        // Respond with success message
        res.json({ message: 'New quote added', newQuote });
      });
    });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});