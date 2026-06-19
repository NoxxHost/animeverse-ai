import dotenv from 'dotenv';
dotenv.config();

export const deepseekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-3c0eaf5f2bda4847bcb0b089fc9d777e',
  baseUrl: 'https://api.deepseek.com/v1/chat/completions'
};
