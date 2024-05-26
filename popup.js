// Define maximum number of messages to save in chat history
const MAX_HISTORY_LENGTH = 10;
let chatHistory = [];

async function query(data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-distilled-squad",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  return result;
}

document.getElementById('submit').addEventListener('click', async () => {
  const queryText = document.getElementById('query').value;
  if (!queryText) return;

  addMessage(queryText, 'user-message');

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => document.body.innerText
    }, async (results) => {
      const bodyText = results[0].result;
      const data = {
        inputs: {
          question: queryText,
          context: bodyText
        }
      };
      
      try {
        const response = await query(data);
        if (response.error) {
          addMessage(`Error: ${response.error}`, 'bot-message');
        } else {
          addMessage(response.answer || 'No relevant information found.', 'bot-message');
        }
      } catch (error) {
        console.error('Error:', error);
        addMessage('An error occurred. Please try again.', 'bot-message');
      }

      // Log the query to the background script
      chrome.runtime.sendMessage({ type: 'LOG_QUERY', query: queryText });
    });
  });
  document.getElementById('query').value = ''; // Clear input field after sending
});

document.getElementById('clear').addEventListener('click', () => {
  clearChat();
});

function addMessage(text, className) {
  const chatContainer = document.getElementById('chat-container');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-bubble ${className}`;
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Auto scroll to the bottom
  
  // Add message to chat history
  chatHistory.push({ text, className });
  // If chat history exceeds maximum length, remove oldest message
  if (chatHistory.length > MAX_HISTORY_LENGTH) {
    chatHistory.shift();
  }
}

function clearChat() {
  const chatContainer = document.getElementById('chat-container');
  chatContainer.innerHTML = ''; // Clear chat container
  chatHistory = []; // Clear chat history
}
