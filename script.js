const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Visa användarens meddelande
  addMessage('Du', userMessage);
  userInput.value = '';

  // Visa "Laddar..." medan vi väntar på svar
  const loadingMessage = addMessage('ZebGPT', 'Skriver...');

  try {
    const response = await fetch('https://zebgpt.onrender.com/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
      throw new Error(`Serverfel: ${response.status}`);
    }

    const data = await response.json();

    // Ta bort "Skriver..." och lägg till svaret
    loadingMessage.remove();
    addMessage('ZebGPT', data.reply || 'Inget svar från AI:n.');
  } catch (error) {
    console.error('Fel vid anrop:', error);
    loadingMessage.remove();
    addMessage('ZebGPT', 'Kunde inte kontakta servern. Försök igen senare.');
  }
});

function addMessage(sender, message) {
  const message
