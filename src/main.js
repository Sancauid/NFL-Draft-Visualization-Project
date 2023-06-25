fetch('./Dataset/draft2.csv') // Replace 'data.csv' with the actual filename if different
  .then(response => response.text())
  .then(csvData => processData(csvData));

function processData(csv) {
  // Parse CSV data here and perform desired operations
  console.log(csv);
  // Process the data further as needed
}
