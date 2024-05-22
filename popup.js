document.getElementById('submit').addEventListener('click', () => {
  const query = document.getElementById('query').value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: () => document.body.innerText
    }, (results) => {
      const bodyText = results[0].result;
      fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: bodyText, query: query })
      })
      .then(response => response.json())
      .then(data => {
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = data.result || 'No relevant information found.';
        
        // Log the query to the background script
        // chrome.runtime.sendMessage({ type: 'LOG_QUERY', query: query });
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  });
});
