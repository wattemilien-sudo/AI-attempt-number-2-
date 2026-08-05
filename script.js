const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');

// Function to add a message to the UI
function addMessage(sender, text) {
  const wrapper = document.createElement('div');
  wrapper.className = `message-wrapper ${sender}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;
  
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  
  // Auto-scroll to the newest message
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener('submit', function(e) {
  e.preventDefault(); 
  
  const message = chatInput.value.trim();
  if (!message) return;

  // 1. Display the user's message
  addMessage('user', message);
  chatInput.value = '';

  // 2. THIS IS WHERE YOU ADD YOUR AI LATER
  // For now, it just waits 1 second and sends a fake response
  setTimeout(() => {
    /* 
      Future API integration goes here:
      const response = await fetch('YOUR_AI_API_URL', { ... });
      const data = await response.json();
      addMessage('ai', data.text);
    */
    
    addMessage('ai', "I'm just a placeholder! Go to script.js to hook up your AI.");
  }, 1000);
});
