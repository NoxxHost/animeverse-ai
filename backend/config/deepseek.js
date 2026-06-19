import dotenv from 'dotenv';
dotenv.config();

export const deepseekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || 'YOUR_DEEPSEEK_API_KEY',
  baseUrl: 'https://api.deepseek.com/v1/chat/completions'
};
