const ApiClient = require('./ApiClient');
const OpenAI = require('openai');

class ApiClientPerplexity extends ApiClient {
  constructor(apiKey, messageLog) {
    super(apiKey, messageLog);
    this.baseURL = "https://api.perplexity.ai";
    this.openai = new OpenAI({ baseURL: this.baseURL, apiKey: this.apiKey });
  }

  async sendMessage(model) {
    const rawMessageLog = this.messageLog.getRawMessageLog();
    const formattedMessageLog = this.transformMessageLog(rawMessageLog);
    //console.log(JSON.stringify(formattedMessageLog, null, 2));
    
    // Import the ora module
    const ora = (await import('ora')).default;

    // Create a new ora instance
    const spinner = ora().start();
    
    const response = await this.openai.chat.completions.create({
      model: model,
      max_tokens: 4096,
      temperature: 0,
      messages: formattedMessageLog,
    });

    // Log the entire response
    console.log('\n\nAPI Response:', response);

    // Stop the spinner
    spinner.stop();
    
    // Return the response
    return response.choices[0].message.content;
  }

  transformMessageLog(rawMessageLog) {
    let transformedMessageLog = [];
    let userContent = '';

    for (let i = 0; i < rawMessageLog.length; i++) {
      let message = rawMessageLog[i];

      if (message.role === 'user') {
        userContent += message.content;
      }
      else {
        if (userContent) {
          transformedMessageLog.push({
            role: 'user',
            content: [{
              type: 'text',
              text: userContent
            }]
          });
          userContent = '';
        }
        transformedMessageLog.push({
          role: 'assistant',
          content: [{ 
            type: message.type,
            text: message.content 
          }]
        });
      }
    }

    // if the last message was a user message, add it to the transformed message log
    if (userContent) {
      transformedMessageLog.push({
        role: 'user',
        content: [{
          type: 'text',
          text: userContent
        }]
      });
    }

    // Add a continue message
    //transformedMessageLog.push({
    //  role: 'assistant',
    //  content: [{ 
    //    type: 'text',
    //    text: 'continue' 
    //  }]
    //});
    
    //console.log(JSON.stringify(transformedMessageLog, null, 2));
    return transformedMessageLog;
  }
}

module.exports = ApiClientPerplexity;