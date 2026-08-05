const http = require('http');
const fs = require('fs');
const path = require('path');

// ⚠️ Replace with your actual OpenRouter / OpenAI API key
const API_KEY = 'YOUR_API_KEY_HERE';

const SCHOOL_DATA_DIR = path.join(__dirname, 'school_data');

// 1. Read all .txt files from school_data using native Node.js
function readSchoolNotes() {
  if (!fs.existsSync(SCHOOL_DATA_DIR)) {
    fs.mkdirSync(SCHOOL_DATA_DIR);
    return [];
  }

  const files = fs.readdirSync(SCHOOL_DATA_DIR);
  let notes = [];

  for (const file of files) {
    if (file.endsWith('.txt')) {
      const content = fs.readFileSync(path.join(SCHOOL_DATA_DIR, file), 'utf8');
      notes.push({ fileName: file, content });
    }
  }
  return notes;
}

// 2. Simple keyword matching
function findRelevantNotes(query, notes) {
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
  let relevantText = '';

  for (const doc of notes) {
    const lines = doc.content.split('\n');
    const matches = lines.filter(line => 
      keywords.some(word => line.toLowerCase().includes(word))
    );

    if (matches.length > 0) {
      relevantText += `\n--- SOURCE: ${doc.fileName} ---\n` + matches.slice(0, 15).join('\n') + '\n';
    }
  }

  return relevantText;
}

// 3. Native HTTP Server (No Express)
const server = http.createServer((req, res) => {
  // Enable CORS so your front-end HTML can make requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser pre-flight checks
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);

        // Fetch curriculum data
        const notes = readSchoolNotes();
        const curriculumContext = findRelevantNotes(message, notes);

        const systemInstruction = `
You are a helpful school tutor.
Answer the user request using the student's curriculum notes provided below.

STUDENT NOTES FOUND:
${curriculumContext || "No specific local notes found for this topic."}
`;

        // Native fetch call to the AI provider
        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-lite-001',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: message }
            ]
          })
        });

        const data = await aiResponse.json();
        const reply = data.choices?.[0]?.message?.content || "No response generated.";

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));

      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: 'Server error processing request.' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000 without any npm packages!');
});
