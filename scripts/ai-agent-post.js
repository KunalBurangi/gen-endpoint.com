// Usage: Set AI_PROVIDER=llama or AI_PROVIDER=gemini and (if Gemini) GEMINI_API_KEY=your-key
// Requires: npm install node-fetch
import fetch from 'node-fetch';

const PROVIDER = process.env.AI_PROVIDER || 'llama'; // 'llama' or 'gemini'
const GEMINI_API_KEY = "AIzaSyDa73tOOkWp_B83A2XxWAddYMokvzm0gbs"; // Set this in your environment

async function generateWithLlama(prompt) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false
    })
  });
  const data = await response.json();
  return data.response;
}

async function generateWithGemini(prompt) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await response.json();
  // Extract the text from Gemini's response
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function postToWebsite(postData) {
  const response = await fetch('https://gen-endpoint.com/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  const data = await response.json();
  console.log('Post response:', data);
}

(async () => {
  const prompt = `
Write a blog post about the future of open-source AI.\nReturn a JSON object with these fields:\n- title: (string)\n- content: (string)\n- excerpt: (string, a short summary)\n- categoryId: (string, a category for the post)\n- tags: (array of strings, relevant tags)\n`;

  let aiResponse;
  if (PROVIDER === 'gemini') {
    aiResponse = await generateWithGemini(prompt);
  } else {
    aiResponse = await generateWithLlama(prompt);
  }

  let postData;
  try {
    postData = JSON.parse(aiResponse);
  } catch {
    // Fallback: use the whole response as content
    postData = {
      title: 'AI Generated Post',
      content: aiResponse,
      excerpt: aiResponse.substring(0, 100),
      categoryId: 'general',
      tags: ['ai']
    };
  }

  await postToWebsite(postData);
})();
