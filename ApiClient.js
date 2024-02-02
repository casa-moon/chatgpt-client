
class ApiClient {
  constructor(apiKey, messageLog) {
    this.apiKey = apiKey;
    this.messageLog = messageLog;
  }

  async sendMessage(model) {
    // Placeholder for sending a message to the AI API
    // This method should be overridden by subclasses that implement specific API logic
    throw new Error('sendMessage() must be implemented by subclasses');
  }

  transformMessageLog(messageLog) {
    throw new Error('transformMessageLog() must be implemented by subclasses');
  }

  stripDocTagsIfOnlyOneSet(userContent) {
    // Count the number of <doc> tags in the userContent string
    let docTagCount = (userContent.match(/<doc>/g) || []).length;

    // If there is only one set of tags, remove them
    if (docTagCount === 1) {
      userContent = userContent.replace(/<doc>|<\/doc>/g, '');
    }
    else if (docTagCount >= 2) {
      // remove the last set of tags
      let lastOpenTag = userContent.lastIndexOf('<doc>');
      let lastCloseTag = userContent.lastIndexOf('</doc>');
      userContent = userContent.substring(0, lastOpenTag) + userContent.substring(lastOpenTag+5, lastCloseTag);
    }
    //console.log("userContent: " + userContent);
    return userContent;
  }
}

module.exports = ApiClient;