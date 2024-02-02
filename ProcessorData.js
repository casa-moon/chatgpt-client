// Load modules
const Processor = require('./Processor');
const FileExtractor = require('./ExtractorFile');
const DirExtractor = require('./ExtractorDir');
const PdfExtractor = require('./ExtractorPdf');
const ImageExtractor = require('./ExtractorImage');
const WebExtractor = require('./ExtractorWeb');
const pathModule = require('path');
const fs = require("fs");
const simpleGit = require("simple-git");
const os = require('os');

class DataProcessor extends Processor {
  
  constructor(chatSession) {
    super(chatSession);
  }
  
  async process(input = null) {
    // If the input is direct input use it, otherwise get the path to the data source
    switch(input) {
      case 'file': case 'f':
      case 'pdf': case 'p':
      case 'xlsx': case 'x':
      case 'image': case 'i':
      case 'dir': case 'd':
      case 'git': case 'g':
      case 'web': case 'w':
        this.path = this.getUserInput('\nEnter path: \n');
        if (!this.path.startsWith('http')) this.path = pathModule.resolve(this.path);
        this.chatSession.appendMessageToFile('\n\n***\n\n### User:\n\n' + this.path);
        break;
      default:
        this.chatSession.appendMessageToFile('\n\n***\n\n### User:\n\n' + input);
        break;
    }
    
    // Prep the environment
    switch (input) {
      case 'file': case 'f':
      case 'pdf': case 'p':
      case 'xlsx': case 'x':
        // Download the file if it's a URL
        if (await this.downloadFile()) break;
        
        // Check if the file exists
        if (!this.checkFileExists()) return null;
        
        // Copy the file to the files directory
        //this.copyFileToDir();
        break;
    }

    // Extract the data
    switch (input) {
      case 'file': case 'f':
        this.tempMessageLog = new FileExtractor(this.chatSession).extract(this.path);
        if (this.tempMessageLog === null) return null;
        break;
      case 'pdf': case 'p':
        let getImagesPdf = false;
        if (this.getUserInput('\nGet images? (y/n default=n) ').toLowerCase().startsWith('y')) {
          this.type = 'pdfi';
          getImagesPdf = true;
        }
        this.tempMessageLog = await new PdfExtractor(this.chatSession).extract(this.path, getImagesPdf);
        break;
      case 'xlsx': case 'x':
        await this.convertExcelToCsv();
        this.tempMessageLog = new DirExtractor(this.chatSession).extract(this.path, false);
        break;
      case 'image':
        this.type = 'image';
        this.tempMessageLog = new ImageExtractor(this.chatSession).extract(this.path);
        break;
      case 'dir': case 'd':
        if (!this.checkDirectoryExists()) return null;
        this.tempMessageLog = new DirExtractor(this.chatSession)
          .extract(this.path, this.getUserInput('\nRecursive? (y/n default=n) ').toLowerCase().startsWith('y'));
        break;
      case 'git': case 'g':
        const gitPath = pathModule.join(this.chatSession.tempDir, pathModule.basename(this.path));
        if (fs.existsSync(gitPath)) fs.rmdirSync(gitPath, { recursive: true });
        const git = simpleGit();
        await git.clone(this.path, gitPath);
        await git.cwd(gitPath);
        this.tempMessageLog = new DirExtractor(this.chatSession)
          .extract(gitPath, this.getUserInput('\nRecursive? (y/n default=n) ').toLowerCase().startsWith('y'));
        break;
      case 'web': case 'w':
        // Get the depth
        const inputDepth = this.getUserInput('\nEnter the depth of extraction (default=0): ');
        let depth = parseInt(inputDepth, 10);
        if (isNaN(depth)) depth = 0;
        
        // Get the images
        let getImagesWeb = false;
        if (this.getUserInput('\nGet images? (y/n default=n) ').toLowerCase().startsWith('y')) {
          this.type = 'webi';
          getImagesWeb = true;
        }
        
        // Extract the data
        this.tempMessageLog = await new WebExtractor(this.chatSession)
          .extract(this.path, depth, getImagesWeb, this.chatSession.isTermux);
        
        break;
      default:
        this.type = 'chat';
        this.chatSession.messageLog.addUserMessage(input);
        break;
    }

    // If this is not a chat input, provide the user with the option to display the data
    if (this.type !== 'chat') {
      // Ask the user if they want to see the data
      this.displayData();

      // Get costs
      this.getTextCost();
      if ((this.type === 'pdfi') || (this.type === 'webi')) this.getImageCost();

      // Confirm send message
      if (!this.confirmSendMessage()) return null;
      
      // Change model
      if ((this.type === 'image') || (this.type === 'pdfi') || (this.type === 'webi')) {
        switch (this.chatSession.model) {
          case 'gpt-4-1106-preview':
            this.chatSession.model = 'gpt-4-vision-preview';
            break;
          case 'gemini-pro':
            this.chatSession.model = 'gemini-pro-vision';
            break;
        }
      }

      // Add directive to message log
      this.addDirectiveToTempMessageLog();

      // Add the user's message to the message log
      this.addTempMessageLogToMessageLog();
    }

    // Send the data to the API
    const responseContent = await this.chatSession.sendMessageToApi();

    // Display the response
    this.displayMarkdown(`${this.capitalizeFirstLetter(this.chatSession.model)}:\n` + responseContent);

    // Add AI's response to the message log
    this.chatSession.messageLog.addModelMessage(responseContent);

    // Append the message to a file
    this.chatSession.appendMessageToFile(`\n\n***\n\n### ${this.capitalizeFirstLetter(this.chatSession.model)}:\n\n` + responseContent);
  }
}

module.exports = DataProcessor;