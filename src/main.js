import { EOL, homedir } from 'os';
import { createInterface } from 'readline/promises';
import { handleUserInput, parseOptions } from './parse.js';

class FileManager {
  constructor() {
    this.settings = { username: 'User' };
    this.lineSeparator = EOL;
    this.interface = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.interface.on('line', async (input) => {
      try {
        await handleUserInput(input, this.interface);
      } catch (error) {
        console.error('[Error]', error?.message || 'An unknown error occurred');
      } finally {
        this.showPrompt();
      }
    });

    this.interface.on('close', () => {
      console.log(
        `...\nThank you for using File Manager, ${this.settings.username}, goodbye!\n`
      );
    });
  }

  showPrompt() {
    this.interface.output.write(`You are currently in: ${process.cwd()}${this.lineSeparator}`);
    this.interface.prompt();
  }

  async initialize() {
    this.processStartupArguments();
    this.displayWelcomeMessage();
    process.chdir(homedir());
    this.showPrompt();
  }

  processStartupArguments() {
    for (let i = 2; i < process.argv.length; i++) {
      const [options] = parseOptions(process.argv[i], false);
      this.settings = { ...this.settings, ...options };
    }
  }

  displayWelcomeMessage() {
    console.log(`Welcome to the File Manager, ${this.settings.username}!`);
    console.log('-------------------------------');
  }
}

new FileManager().initialize();