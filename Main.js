// Load modules
const { prompt } = require('enquirer');
const ChatSession = require('./ChatSession');
const { getChoices: getApiChoices, createApiClient } = require('./ApiClientFactory');
const MessageLog = require('./MessageLog');
const DataProcessor = require('./ProcessorData');

class Main {
  constructor() {
    this.messageLog = new MessageLog();
  }

  async run() {
    // Select API client and model via factory
    const { api } = await prompt({
      type: 'select',
      name: 'api',
      message: 'Select API',
      choices: getApiChoices()
    });
    const { apiClient, model } = createApiClient(api, this.messageLog);
    this.apiClient = apiClient;
    this.model = model;
    this.chatSession = new ChatSession(this.apiClient, this.model, this.messageLog);

    console.log(
      "\ncommands: " +
      "Chat, File, PDF, Excel (xlsx), Image, Directory, Git, Web, Save, Exit\n"
    );

    // Command selection loop using Enquirer select
    const commandChoices = [
      { name: 'chat', message: 'Direct Chat Input' },
      { name: 'file', message: 'File' },
      { name: 'pdf', message: 'PDF' },
      { name: 'xlsx', message: 'Excel (xlsx)' },
      { name: 'image', message: 'Image' },
      { name: 'dir', message: 'Directory' },
      { name: 'git', message: 'Git Repository' },
      { name: 'web', message: 'Web Page' },
      { name: 'save', message: 'Save Chat Session' },
      { name: 'exit', message: 'Exit Application' }
    ];
    while (true) {
      const { command } = await prompt({
        type: 'select', name: 'command', message: 'Select command', choices: commandChoices
      });
      switch (command) {
        case 'save':
          this.chatSession.cleanUp(true);
          return;
        case 'exit':
          this.chatSession.cleanUp();
          return;
        case 'chat': {
          const { input } = await prompt({ type: 'input', name: 'input', message: 'Chat Input:' });
          await new DataProcessor(this.chatSession).process(input);
          break;
        }
        default:
          await new DataProcessor(this.chatSession).process(command);
      }
    }
  }
}

// Load the main class and run the application
new Main().run().then();