// Load modules
const readlineSync = require('readline-sync');
const ChatSession = require('./ChatSession');
const ApiClientOpenAi = require('./ApiClientOpenAI');
const ApiClientGoogle = require('./ApiClientGoogle');
const ApiClientAnthropic = require('./ApiClientAnthropic');
const ApiClientMistral = require('./ApiClientMistral');
const MessageLog = require('./MessageLog');
const DataProcessor = require('./ProcessorData');

class Main {
  constructor() {
    // Initialize the message log manager
    this.messageLog = new MessageLog();
    
    // Initialize the API client
    const api = readlineSync.question('openai=1, google=2, anthropic=3, mistral=4 (default=1) ');
    switch(api) {
      case '1':
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = "gpt-4-0125-preview";
        break;
      case '2':
        this.apiClient = new ApiClientGoogle(process.env.GOOGLE_API_KEY, this.messageLog);
        this.model = "gemini-pro";
        break;
      case '3':
        this.apiClient = new ApiClientAnthropic(process.env.ANTHROPIC_API_KEY, this.messageLog);
        this.model = "claude-2.1";
        break;
      case '4':
        this.apiClient = new ApiClientMistral(process.env.MISTRAL_API_KEY, this.messageLog);
        this.model = "mistral-medium";
        break;
      default:
        this.apiClient = new ApiClientOpenAi(process.env.OPENAI_API_KEY, this.messageLog);
        this.model = "gpt-4-0125-preview";
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