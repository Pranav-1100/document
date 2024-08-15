const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateChatResponse(messages) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        stream: false,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  async generateStreamingChatResponse(messages, res) {
    try {
      const stream = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages.filter(msg => msg.content != null), // Filter out null content
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ type: 'bot', content: content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'end', content: 'Stream ended' })}\n\n`);
      res.end();

      return fullResponse;
    } catch (error) {
      console.error('Error in OpenAI streaming:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`);
      res.end();
      throw error;
    }
  }
}

module.exports = new OpenAIService();