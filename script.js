// This asks for your key in the browser and saves it securely on your PC
let API_KEY = localStorage.getItem('AQ.Ab8RN6LGsS10MZWBqOzrLuiNrovh3ZcMt5KWJ0LvAaTC9ZFz8g');

if (!API_KEY) {
  API_KEY = prompt('Please paste your Google Gemini API Key:');
  if (API_KEY) {
    localStorage.setItem('gemini_key', API_KEY);
  }
}

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');

function addMessage(sender, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return bubble;
}

chatForm.addEventListener('submit', async function(e) {
  e.preventDefault(); 
  
  if (!API_KEY) {
    alert("No API key found. Refresh the page to enter your key.");
    return;
  }

  const userMessage = chatInput.value.trim();
  if (!userMessage) return;

  addMessage('user', userMessage);
  chatInput.value = '';

  const loadingBubble = addMessage('ai', 'Thinking...');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      const aiReply = data.candidates[0].content.parts[0].text;
      loadingBubble.textContent = aiReply;
    } else {
      loadingBubble.textContent = `Error: ${data.error?.message || 'Check your API Key'}`;
    }
  } catch (err) {
    loadingBubble.textContent = 'Connection error. Check your browser console.';
    console.error(err);
  }
});
