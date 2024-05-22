chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    // Perform initial setup tasks here
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'LOG_QUERY') {
      console.log('User query:', message.query);
    }
    sendResponse({status: 'received'});
  });
  