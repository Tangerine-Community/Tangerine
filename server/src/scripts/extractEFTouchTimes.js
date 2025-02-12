const fs = require('fs');
const cheerio = require('cheerio');

// Read the HTML file
const html = fs.readFileSync('./animal-go-no-go/form.html', 'utf-8');

// Load the HTML content using Cheerio
const $ = cheerio.load(html);

// Define an array to store extracted data
const extractedData = [];

// Select all <tangy-eftouch> elements
$('tangy-eftouch').each(function () {
  const nameValue = $(this).attr('name');
  const timeLimitValue = $(this).attr('transition-delay');
  
  extractedData.push({ name: nameValue, timeLimit: timeLimitValue });
});

// Output the extracted data in a table format
console.table(extractedData);
