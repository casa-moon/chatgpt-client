const ApiClient = require('./ApiClient');

class ApiClientMistral extends ApiClient {
  constructor(apiKey, messageLog) {
    super(apiKey, messageLog);
  }

  async sendMessage(model) {
    const MistralClient = (await import('@mistralai/mistralai')).default;
    this.mistral = new MistralClient(this.apiKey);
    
    const rawMessageLog = this.messageLog.getRawMessageLog();
    const formattedMessageLog = this.transformMessageLog(rawMessageLog);

    // Display the formatted message log
    //console.log(JSON.stringify(formattedMessageLog, null, 2));

    // Import the ora module
    const ora = (await import('ora')).default;

    // Create a new ora instance
    const spinner = ora().start();

    const response = await this.mistral.chat({
      model: model,
      temperature: 0,
      max_tokens: 4096,
      messages: formattedMessageLog
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
        userContent += `<doc>${message.content}</doc>`;
      }
      else {
        if (userContent) {
          transformedMessageLog.push({
            role: 'user',
            content: userContent
          });
          userContent = '';
        }
        transformedMessageLog.push({
          role: 'assistant',
          content: message.content
        });
      }
    }

    // if the last message was a user message, add it to the transformed message log
    if (userContent) {
      transformedMessageLog.push({
        role: 'user',
        content: userContent
      });
    }

    return transformedMessageLog;
  }
}

module.exports = ApiClientMistral;