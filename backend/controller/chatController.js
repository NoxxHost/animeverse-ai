import { deepseekConfig } from '../config/deepseek.js';

export const handleChat = async (req, res, next) => {
  try {
    const { message, history, systemPrompt } = req.body;

    if (!message || !systemPrompt) {
      return res.status(400).json({ success: false, message: 'Message and system prompt are required.' });
    }

    // Membangun payload pesan beserta history chat untuk context memory
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];

    const response = await fetch(deepseekConfig.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekConfig.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch response from DeepSeek API');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.status(200).json({
      success: true,
      reply: reply
    });
  } catch (error) {
    next(error);
  }
};
