const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Kolla om knappen ligger i ett form-element (för att stoppa reload vid submit)
const form = sendBtn.closest('form');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Stoppar reload vid submit
    await handleSend();
  });
} else {
  // Om inget form-element, kör på klick-event på knappen
  sendBtn.addEventListener('click', async () => {
    await handleSend();
  });
}

function formatReply(reply) {
  // Kolla om svaret är en numrerad lista (1. 2. 3. ...)
  const lines = reply.split('\n');
  const isList = lines.every(line => /^\d+\.\s/.test(line.trim()));

  if (isList) {
    const listItems = lines
      .map(line => `<li>${line.replace(/^\d+\.\s/, '')}</li>`)
      .join('');
    return `<ul>${listItems}</ul>`;
  } else {
    // Annars behåll radbrytningar
    return reply.replace(/\n/g, '<br>');
  }
}

async function handleSend() {
  const message = userInput.value.trim();
  if (!message) return;

  // Lägg till användarens fråga i chatten med en klass för styling
  chatBox.innerHTML += `<p class="chat-message user"><strong>Du:</strong> ${message}</p>`;
  userInput.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  // Visa "tänker..." medan vi väntar på svar
  const thinking = document.createElement('p');
  thinking.className = 'chat-message bot';
  thinking.innerHTML = `<em>ZebGPT tänker...</em>`;
  chatBox.appendChild(thinking);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch('/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // Ta bort "tänker..."
    chatBox.removeChild(thinking);

    if (data.reply) {
      const formatted = formatReply(data.reply);
      chatBox.innerHTML += `<p class="chat-message bot"><strong>ZebGPT:</strong><br>${formatted}</p>`;
    } else {
      chatBox.innerHTML += `<p class="chat-message bot"><strong>ZebGPT:</strong> Något gick fel.</p>`;
    }
  } catch (err) {
    chatBox.removeChild(thinking);
    chatBox.innerHTML += `<p class="chat-message bot"><strong>ZebGPT:</strong> Fel vid anrop.</p>`;
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
