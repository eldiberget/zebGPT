import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Behövs för att __dirname ska funka i ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Starta appen
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servera statiska filer (CSS, JS, bilder etc)
app.use(express.static(__dirname));

// Skicka HTML-filen vid start
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initiera OpenAI med din API-nyckel
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST-endpoint för att ta emot meddelanden från frontend
app.post('/openai', async (req, res) => {
  const { message } = req.body;
  console.log('Fick fråga:', message);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Kontrollera att detta är rätt modellnamn
      messages: [
        {
          role: 'system',
          content: `Du är en hjälpsam svensk assistent. När användaren frågar om något som kan listas, svara med en tydlig numrerad lista där varje punkt är på en egen rad, t.ex:

          1. Punkt ett
          2. Punkt två
          3. Punkt tre

          Använd radbrytningar mellan punkterna och inga löpande stycken i sådana svar.`
        },
        {
          role: 'user',
          content: message
        }
      ],
    });

    const reply = completion.choices[0].message.content;
    console.log('Svar från OpenAI:', reply);

    res.json({ reply });
  } catch (error) {
    console.error('Fel i OpenAI-anrop:', error);
    res.status(500).json({ error: error.message || 'Något gick fel' });
  }
});

// Starta servern
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ZebGPT servern körs på port ${PORT}`);
});
