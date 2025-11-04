
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Servir o arquivo HTML
  if (req.url === '/' || req.url === '/test-client.html') {
    fs.readFile(path.join(__dirname, 'test-client.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading HTML file');
        return;
      }
      
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*' 
      });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Cliente de teste rodando em: http://localhost:${PORT}`);
  console.log(`🔗 Acesse: http://localhost:${PORT}/test-client.html`);
});