const ApiClient = require('./ApiClient');
const OpenAI = require('openai');

class ApiClientOpenAI extends ApiClient {
  constructor(apiKey, messageLog) {
    super(apiKey, messageLog);
    this.openai = new OpenAI({ apiKey: this.apiKey });
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
    // Transform the raw message log into the format expected
    return rawMessageLog.map(message => {
      // If the role is model, change it to assistant
      const role = message.role === 'model' ? 'assistant' : message.role;

      let content = [];
      if (message.type === 'text') {
        content = [{
          type: message.type,
          text: message.content
        }];
      }
      else if (message.type === 'image') {
        content = [{
          type: 'image_url',
          image_url: {
            url: message.content
          }
        }];
      }
      
      return { role, content };
    });
  }
}

module.exports = ApiClientOpenAI;