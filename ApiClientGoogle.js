const ApiClient = require('./ApiClient');
const { GoogleGenerativeAI } = require("@google/generative-ai");

class ApiClientGoogle extends ApiClient {
  constructor(apiKey, messageLog) {
    super(apiKey, messageLog);
    this.google = new GoogleGenerativeAI(this.apiKey);
  }

  async sendMessage(model) {
    const rawMessageLog = this.messageLog.getRawMessageLog();
    const formattedMessageLog = this.transformMessageLog(rawMessageLog);
    //console.log(JSON.stringify(formattedMessageLog, null, 2));
    
    // Import the ora module
    const ora = (await import('ora')).default;

    // Create a new ora instance
    const spinner = ora().start();

    // Initialize the model
    this.model = this.google.getGenerativeModel({ model: model});
    
    //console.log(formattedMessageLog);
    const chat = this.model.startChat({
      history: formattedMessageLog,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
    const msg = `${this.getLastUserMessage(rawMessageLog)}`;
    //console.log(msg);
    const result = await chat.sendMessage(msg);
    const response = await result.response;

    // Log the entire response
    //console.log('\n\nAPI Response:', JSON.stringify(response, null, 2));

    const text = response.text();
    //console.log(text);

    // Stop the spinner
    spinner.stop();

    // Return the response
    return text;
  }

  transformMessageLog(rawMessageLog) {
    let transformedMessageLog = [];
    let userContent = '';

    for (let i = 0; i < rawMessageLog.length; i++) {
      let message = rawMessageLog[i];

      if (message.role === 'user') {
        userContent += `<doc>${message.content}</doc>`;
      }
      else {
        if (userContent) {
          transformedMessageLog.push({
            role: 'user',
            parts: this.stripDocTagsIfOnlyOneSet(userContent)
          });
          userContent = '';
        }
        transformedMessageLog.push({
          role: 'model',
          parts: message.content
        });
      }
    }

    // if the last message was a user message, add it to the transformed message log
    if (userContent) {
      transformedMessageLog.push({
        role: 'user',
        parts: this.stripDocTagsIfOnlyOneSet(userContent)
      });
    }
    
    // Add a continue message
    transformedMessageLog.push({
      role: 'model',
      parts: 'continue'
    });
    return transformedMessageLog;
  }

  getLastUserMessage(messageLog) {
    for (let i = messageLog.length - 1; i >= 0; i--) {
      if (messageLog[i].role === 'user') return messageLog[i].content;
    }
    return null;
  }
}

module.exports = ApiClientGoogle;