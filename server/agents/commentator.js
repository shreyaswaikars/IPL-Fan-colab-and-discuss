require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Fallback commentary templates when Gemini is not available
const fallbackTemplates = {
  SIX: [
    "That's massive! The ball disappeared into the crowd!",
    "Six! What a clean strike! The crowd erupts!",
    "Boom! Into the stands! That's six runs!",
  ],
  FOUR: [
    "Racing to the boundary! Four runs!",
    "Cracking shot through the covers! Four!",
    "That's found the gap perfectly — four runs!",
  ],
  WICKET: [
    "OUT! The stumps are rattled! Big wicket falls!",
    "That's OUT! What a delivery! The batter walks back!",
    "Timber! The crowd goes wild as the wicket falls!",
  ],
  FIFTY: [
    "Half-century! What a magnificent knock! The crowd on their feet!",
    "50 up! Brilliant batting — a deserved milestone!",
    "That's a fifty! Class act with the bat!",
  ],
  CENTURY: [
    "CENTURY! 100 not out! Absolutely sensational batting!",
    "A HUNDRED! What a masterclass! One of the innings of the IPL!",
    "Three figures! The crowd erupts for this brilliant century!",
  ],
  MATCH_START: [
    "And we're off! The IPL action begins!",
    "Play! The crowd is buzzing as the match gets underway!",
    "Let the battle begin! It's IPL time!",
  ],
  MATCH_END: [
    "That's the match! What a game of cricket!",
    "And it's all over! A thrilling IPL encounter concludes!",
    "Final result confirmed! What a spectacle of T20 cricket!",
  ],
};

function getFallbackCommentary(eventType) {
  const options = fallbackTemplates[eventType] || [
    "What a moment in this IPL match!",
    "The crowd is absolutely loving this!",
    "Incredible scenes here today!",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

async function generateCommentary(matchContext, event) {
  if (!genAI) {
    return getFallbackCommentary(event.type);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const matchInfo = matchContext
      ? `${matchContext.team1?.shortName || 'Team A'} vs ${matchContext.team2?.shortName || 'Team B'} at ${matchContext.venue || 'the stadium'}`
      : 'IPL 2026';

    const prompt = `You are an enthusiastic, witty IPL cricket commentator known for your sharp one-liners and deep cricket knowledge.

Match: ${matchInfo}
Event Type: ${event.type}
Player: ${event.player || 'Unknown'}
Team: ${event.team || 'Unknown'}
Description: ${event.description || ''}

Deliver EXACTLY ONE short, punchy, entertaining commentary line (maximum 2 sentences, around 20-30 words). 
Be energetic, use cricket terminology naturally, and capture the excitement of the moment. 
Do NOT use quotation marks. Do NOT add any prefix or label. Just the commentary line itself.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || getFallbackCommentary(event.type);
  } catch (err) {
    console.error('[Gemini] Error generating commentary:', err.message);
    return getFallbackCommentary(event.type);
  }
}

module.exports = { generateCommentary };
