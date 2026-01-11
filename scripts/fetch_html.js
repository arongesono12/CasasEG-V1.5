const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.split('\n').slice(0, 120).join('\n');
    console.log(lines);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Fetch failed:', err.message);
  process.exit(1);
});
