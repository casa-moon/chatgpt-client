// Load modules
const readlineSync = require('readline-sync');
const pathModule = require('path');
const axios = require("axios");
const fs = require("fs");
const {isWithinTokenLimit} = require("gpt-tokenizer");
const TerminalRenderer = require('marked-terminal').default;
const marked = require('marked');
const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Initialize variables
marked.setOptions({
  renderer: new TerminalRenderer()
});

class Processor {
  constructor(chatSession) {
    this.chatSession = chatSession;
    this.message = '';
    this.path = '';
    this.tempMessageLog = []; 
    this.type = '';
  }

  async process() {
    throw new Error('process() must be implemented by subclasses');
  }

  addDirectiveToTempMessageLog() {
    const directive = this.getUserInput('\nEnter a directive: \n');
    
    this.tempMessageLog.push({
      role: "user",
      type: "text",
      content: directive
    });
    
    // Append the directive to the chat file
    this.chatSession.appendMessageToFile('\n\n***\n\n### User:\n\n' + directive);
  }

  addTempMessageLogToMessageLog() {
    // add the tempMessageLog to the messageLog
    this.chatSession.messageLog.addTempMessageLog(this.tempMessageLog);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  checkDirectoryExists() {
    // Check if the directory exists
    if (!fs.existsSync(this.path)) {
      console.log('\nDirectory not found.\n');
      return false;
    }
    return true;
  }
  checkFileExists() {
    // Check if the file exists
    if (!fs.existsSync(this.path)) {
      console.log('\nFile not found.\n');
      return false;
    }
    return true;
  }
  
  confirmSendMessage() {
    const answer = readlineSync.question(`\nDo you want to send it? (y/n default=n) `);
    if (answer.toLowerCase() === 'y') {
      return true;
    }
    console.log('\nMessage not sent.');
    return false;
  }

  async convertExcelToCsv() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.path);
    
    // Create a temp directory
    const tempDir = this.chatSession.tempDir + '/csv';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (const worksheet of workbook.worksheets) {
      await this.sheetToCsv(worksheet, tempDir);
    }
    
    this.path = tempDir;
  }

  copyFileToDir() {
    // Copy the file to the files directory if it's not already there
    if (!this.path.includes(this.chatSession.dir)) {
      // copy the file to the directory
      const newFilePath = pathModule.join(this.chatSession.dir, pathModule.basename(this.path));
      fs.copyFileSync(this.path, newFilePath);
      this.path = newFilePath;

      console.log('\nFile copied to ' + this.chatSession.dir + ' directory.');
    }
    return true;
  }
  
  displayData() {
    const answer = this.getUserInput('\nDisplay the data? (y/n default=n) ');
    if (answer.toLowerCase() === 'y') {
      console.log('\n' + JSON.stringify(this.tempMessageLog, null, 2)
        .replace(/\\n/g, '\n'));
    }
  }

  displayMarkdown(responseContent) {
    const formattedContent = marked.parse(responseContent);
    console.log('\n' + formattedContent);
  }
  
  async downloadFile() {
    if (this.path.startsWith('http://') || this.path.startsWith('https://')) {
      const response = await axios({
        method: 'get',
        url: this.path,
        responseType: 'stream'
      });

      const filePath = pathModule.join(this.chatSession.tempDir, pathModule.basename(this.path));
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      this.path = filePath;
      return true;
    }
    return false;
  }
  
  getImageCost() {
    const cost = this.chatSession.imageTokenCount / 1000 * .01;
    console.log(`\nThis image data is ~${this.chatSession.imageTokenCount} tokens and ~$${cost.toFixed(2)}. `);
  }

  getTextCost() {
    let textMessageLog = this.tempMessageLog.filter(message => message.type !== 'image');
    const tokens = isWithinTokenLimit(JSON.stringify(textMessageLog).replace(/<|endoftext|>/g), 1000000000);
    const cost = tokens / 1000 * .01;
    console.log(`\nThis text data is ~${tokens} tokens and ~$${cost.toFixed(2)}. `);
  }

  getUserInput(promptMessage) {
    return readlineSync.question(promptMessage);
  }

  async sheetToCsv(worksheet, outputDir) {
    // Find the number of columns dynamically
    let numColumns = 0;
    worksheet.eachRow((row, rowNumber) => {
      numColumns = Math.max(numColumns, row.values.length);
    });

    // Generate headers based on the number of columns
    const headers = Array.from({ length: numColumns }, (_, i) => `Column${i + 1}`);

    const csvWriter = createCsvWriter({
      path: pathModule.join(outputDir, `${worksheet.name}.csv`),
      header: headers // Add headers to the CSV writer configuration
    });

    const records = worksheet.getSheetValues()
      .map(row => row.reduce((record, value, index) => {
        // Use the headers as keys instead of the indices
        record[headers[index]] = value;
        return record;
      }, {}))
      .filter(record => record !== undefined); // Filter out undefined values

    await csvWriter.writeRecords(records);
  }
}

module.exports = Processor;