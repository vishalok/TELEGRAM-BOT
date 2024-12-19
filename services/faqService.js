require('dotenv').config();

const OpenAI =  require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function faqService(question) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        prompt: `Answer this digital marketing question: ${question}`,
        max_tokens: 20,
    });

    return response.data.choices[0].text.trim();
}

module.exports = faqService;