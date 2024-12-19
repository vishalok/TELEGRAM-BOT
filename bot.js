require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const keywordGenerator = require('./services/keywordGenerator');
const trendFetcher = require('./services/trendFetcher');
const faqService = require('./services/faqService');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// State management for user input
const userState = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Welcome! I can help you with:\n1. Generate Keywords\n2. Predict Industry Trends\n3. Digital Marketing FAQs\n\nType /keywords, /trends, or /faq to get started.`);
});

// Step 1: Collect User Data for Keywords
bot.onText(/\/keywords/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { step: 1, data: {} };
    bot.sendMessage(chatId, 'What industry is your business in?');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (!userState[chatId]) return;

    const userStep = userState[chatId].step;

    try {
        switch (userStep) {
            case 1:
                userState[chatId].data.industry = msg.text;
                userState[chatId].step = 2;
                bot.sendMessage(chatId, 'What is your business objective? (e.g., lead generation, sales)');
                break;

            case 2:
                userState[chatId].data.objective = msg.text;
                userState[chatId].step = 3;
                bot.sendMessage(chatId, 'Do you have a website? If yes, please enter the URL.');
                break;

            case 3:
                userState[chatId].data.website = msg.text || 'N/A';
                userState[chatId].step = 4;
                bot.sendMessage(chatId, 'Do you have any social media platforms? If yes, provide the URL.');
                break;

            case 4:
                userState[chatId].data.socialMedia = msg.text || 'N/A';
                userState[chatId].step = 5;
                bot.sendMessage(chatId, 'Do you use PPC campaigns? (yes/no)');
                break;

            case 5:
                userState[chatId].data.ppc = msg.text.toLowerCase() === 'yes';
                userState[chatId].step = 6;
                bot.sendMessage(chatId, 'Who are you trying to reach? (e.g., young adults, professionals)');
                break;

            case 6:
                userState[chatId].data.audience = msg.text;
                userState[chatId].step = 7;
                bot.sendMessage(chatId, 'What location would you like to target?');
                break;

            case 7:
                userState[chatId].data.location = msg.text;
                const keywords = await keywordGenerator(userState[chatId].data);
                bot.sendMessage(chatId, `Here are some relevant keywords for your business:\n${keywords.join(', ')}`);
                delete userState[chatId];
                break;

            default:
                bot.sendMessage(chatId, 'I didn’t understand that. Please start over with /keywords.');
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Something went wrong. Please try again.');
    }
});

// Step 2: Fetch Industry Trends
bot.onText(/\/trends/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const trends = await trendFetcher();
        bot.sendMessage(chatId, `Here are the latest industry trends:\n${trends}`);
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Failed to fetch trends. Please try again later.');
    }
});

// Step 3: Digital Marketing FAQ
bot.onText(/\/faq/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Ask me any question about digital marketing.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (!userState[chatId]) {
        try {
            const answer = await faqService(msg.text);
            bot.sendMessage(chatId, answer);
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, 'I could not find an answer to your question.');
        }
    }
});
