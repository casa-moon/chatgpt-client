# ChatGPT with Data Processing Extensions

This repository contains a Node.js application that extends the capabilities of ChatGPT by allowing it to process and extract data from various sources such as files, directories, PDFs, images, web pages, and Git repositories. The application integrates with multiple AI models including OpenAI's GPT models, Google's Generative AI, Anthropic's Claude, and Mistral AI for processing natural language and generating responses.

## Features

- **File Processing**: Extract text from plain text files.
- **PDF Processing**: Extract text and optionally images from PDF documents.
- **Image Processing**: Send image URLs directly to the AI model.
- **Directory Processing**: Recursively process and extract data from directories.
- **Git Repository Processing**: Clone Git repositories and process their contents.
- **Web Page Processing**: Scrape text and optionally images from web pages.
- **Excel Processing**: Convert Excel files to CSV and process the data.
- **Data Display**: Option to display extracted data before sending it to the AI model.
- **Cost Estimation**: Estimate the token and cost implications of processing images and text data.
- **Model Selection**: Choose between different AI models for processing the data.
- **Termux Support**: Enhanced compatibility for running the application within the Termux environment on Android devices.

## Installation

To install the necessary dependencies, run the following command:

```bash
npm install
```

### Termux Support

For users running this application within the Termux environment on Android devices, there is a specific requirement for the `sharp` library due to its native dependencies. To ensure compatibility, use the following commands:

```bash
npm install --force @img/sharp-wasm32
```

This command forces the installation of a WebAssembly (WASM) version of the `sharp` library, which is compatible with the Termux environment.

```bash
git reset --hard origin/develop
```

This command updates the local repository with the latest changes from the remote repository, ignoring any local changes. This is required since the package.json file is modified during the installation process.

## Usage

To start the application, run:

```bash
node --no-warnings Main.js
```

Follow the prompts to input commands and paths to data sources. The application will process the data and interact with the AI model to generate responses.

## Commands

The first letter can be used as a shortcut for each command.

- `file`: Process a text file.
- `pdf`: Process a PDF file.
- `xlsx`: Process an Excel file.
- `image`: Process an image URL.
- `dir`: Process a directory.
- `git`: Process a Git repository.
- `web`: Process a web page.
- `save`: Save the current chat session.
- `exit`: Exit the application.

## Configuration

Set the following environment variables with your API keys before running the application:

- `OPENAI_API_KEY`: Your OpenAI API key.
- `GOOGLE_API_KEY`: Your Google Generative AI API key.
- `ANTHROPIC_API_KEY`: Your Anthropic API key.
- `MISTRAL_API_KEY`: Your Mistral AI API key.

## App Data

The application stores data in specific directories within the user's home directory or, for Termux users, in the download directory. Here's a quick overview:

- **Chat Transcripts**: Saved in `~/.chatgpt-client/chats`, each session is stored in a Markdown file named with the session's start timestamp.

- **Processed Files**: Files processed by the application, such as converted or extracted files, are stored in `~/.chatgpt-client/files`.

- **Temporary Data**: Used for intermediate processing steps, temporary data is stored in `~/.chatgpt-client/temp` and is managed automatically by the application.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.