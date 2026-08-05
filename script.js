// Get key from storage or prompt user
let API_KEY = localStorage.getItem('AQ.Ab8RN6KtM4lnwWCMVotwJ6dRPI4yC8RvKAzCtcw3zKgguZ3HOA');

if (!API_KEY) {
  API_KEY = prompt('Please paste gemini api key');
  if (API_KEY) {
    API_KEY = API_KEY.trim(); // Removes any accidental spaces
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
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY // Official header method
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userMessage }] }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      const aiReply = data.candidates[0].content.parts[0].text;
      loadingBubble.textContent = aiReply;
    } else {
      loadingBubble.textContent = `Error: ${data.error?.message || 'Invalid API key or response'}`;
      // If key is invalid, offer to clear it
      if (data.error?.code === 400 || data.error?.code === 401) {
        localStorage.removeItem('gemini_key');
        API_KEY = null;
      }
    }
  } catch (err) {
    loadingBubble.textContent = 'Connection error. Check your browser console.';
    console.error(err);
  }
});
