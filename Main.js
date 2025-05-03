// Load modules
const { prompt } = require('enquirer');
const ChatSession = require('./ChatSession');
const ApiClientOpenAi = require('./ApiClientOpenAI');
const ApiClientGoogle = require('./ApiClientGoogle');
const ApiClientAnthropic = require('./ApiClientAnthropic');
const ApiClientPerplexity = require('./ApiClientPerplexity');
const ApiClientMistral = require('./ApiClientMistral');
const MessageLog = require('./MessageLog');
const DataProcessor = require('./ProcessorData');

class Main {
  constructor() {
    this.messageLog = new MessageLog();
  }

  async run() {
    // Select API client and model
    const { api } = await prompt({
      type: 'select',
      name: 'api',
      message: 'Select API',
      choices: [
        { name: '1', message: 'gpt-4.1' },
        { name: '2', message: 'o4-mini' },
        { name: '3', message: 'gemini-1.5-pro-latest' },
        { name: '4', message: 'claude-3-5-sonnet-20240620' },
        { name: '5', message: 'llama-3.1-sonar-large-128k-chat' },
        { name: '6', message: 'mistral-medium' }
      ]
    });
    switch (api) {
      case '1':
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = 'gpt-4.1';
        break;
      case '2':
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = 'o4-mini';
        break;
      case '3':
        this.apiClient = new ApiClientGoogle(process.env.GOOGLE_AI_API_KEY, this.messageLog);
        this.model = 'gemini-1.5-pro-latest';
        break;
      case '4':
        this.apiClient = new ApiClientAnthropic(process.env.ANTHROPIC_API_KEY, this.messageLog);
        this.model = 'claude-3-5-sonnet-20240620';
        break;
      case '5':
        this.apiClient = new ApiClientPerplexity(process.env.PERPLEXITY_API_KEY, this.messageLog);
        this.model = 'llama-3.1-sonar-large-128k-chat';
        break;
      case '6':
        this.apiClient = new ApiClientMistral(process.env.MISTRAL_API_KEY, this.messageLog);
        this.model = 'mistral-medium';
        break;
      default:
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = 'gpt-4.1';
    }
    this.chatSession = new ChatSession(this.apiClient, this.model, this.messageLog);

    console.log(
      "\ncommands: " +
      "(f)ile, " +
      "pdf, " +
      "xlsx, " +
      "image, " +
      "dir, " +
      "git, " +
      "web, " +
      "save, " +
      "exit" +
      " (default=direct input)" +
      '\n'
    );

    // Main loop with multi-line input via editor
    while (true) {
      const { input } = await prompt({ type: 'input', name: 'input', message: 'User:' });
      const trimmed = input.trim();
      if (trimmed === 'save' || trimmed === 's') {
        this.chatSession.cleanUp(true);
        break;
      }
      if (trimmed === 'exit' || trimmed === 'e') {
        this.chatSession.cleanUp();
        break;
      }
      await new DataProcessor(this.chatSession).process(input);
    }
  }
}

// Load the main class and run the application
new Main().run().then();