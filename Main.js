// Load modules
const readlineSync = require('readline-sync');
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
    // Initialize the message log manager
    this.messageLog = new MessageLog();
    
    // Initialize the API client
    const api = readlineSync.question('gpt-4o=1, o1=2, gemini=3, claude=4, perplexity=5, mistral=6 (default=1) ');
    switch(api) {
      case '1':
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = "gpt-4o";
        break;
      case '2':
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = "o1-mini";
        break;
      case '3':
        this.apiClient = new ApiClientGoogle(process.env.GOOGLE_AI_API_KEY, this.messageLog);
        this.model = "gemini-1.5-pro-latest";
        break;
      case '4':
        this.apiClient = new ApiClientAnthropic(process.env.ANTHROPIC_API_KEY, this.messageLog);
        this.model = "claude-3-5-sonnet-20240620";
        break;
      case '5':
        this.apiClient = new ApiClientPerplexity(process.env.PERPLEXITY_API_KEY, this.messageLog);
        this.model = "llama-3.1-sonar-large-128k-chat";
        break;
      case '6':
        this.apiClient = new ApiClientMistral(process.env.MISTRAL_API_KEY, this.messageLog);
        this.model = "mistral-medium";
        break;
      default:
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = "gpt-4o";
        break;
    }
    
    // Initialize the chat session
    this.chatSession = new ChatSession(this.apiClient, this.model, this.messageLog);

    // Display instructions
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
  }

  async run() {
    
    // Command loop
    const loop = async () => {
      const input = readlineSync.question('\n\nUser: \n');

      switch (input) {
        case 'save': case 's':
          this.chatSession.cleanUp(true);
          return;
        case 'exit': case 'e':
          this.chatSession.cleanUp();
          return;
        default:
          await new DataProcessor(this.chatSession).process(input);
          break;
      }
      await loop(); // Continue the loop
    };
    await loop(); // Start the loop
  }
}

// Load the main class and run the application
new Main().run().then();