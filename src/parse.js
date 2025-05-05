import { resolve  } from 'path';
import * as Commands from './commands/index.js';

function extractPath(inputPath) {
  const space = ' ';
  const doubleQuoted = inputPath.match(/^"([^"]*)"/);
  if (doubleQuoted) return [doubleQuoted[1], inputPath.slice(doubleQuoted[0].length)];

  const singleQuoted = inputPath.match(/^\s*'([^']*)'(?:\s|$)/);
  if (singleQuoted) return [singleQuoted[1], inputPath.slice(singleQuoted[0].length)];

  const [pathPart, ...remainingParts] = inputPath.split(space);
  return [pathPart, remainingParts.join(space)];
}

export function parseOptions(optionString, shouldParseSub = true) {
  const optionPattern = typeof optionString === 'string' 
    ? optionString.match(/^--?(\w+)(?:=(.*))?/) 
    : null;
  
  if (!optionPattern) return [{}, ''];

  const [, optionKey, optionValue] = optionPattern;
  const remainingString = optionString.slice(optionPattern[0].length);

  const parsedOptionValue = optionValue 
    ? (shouldParseSub ? extractPath(optionValue)[0] : optionValue) 
    : true;
  
  return [{ [optionKey]: parsedOptionValue }, remainingString];
}

export async function handleUserInput(userInput, readlineInterface) {
  const extractCommand = (inputString) => {
    const [commandName, ...argsArray] = inputString.trim().split(' ');
    return [commandName, argsArray.join(' ')];
  }

  const [commandName, argumentsString] = extractCommand(userInput);
  let parsedArguments;

  const executeCommand = async (action, ...params) => {
    try {
      await action(...params);
    } catch (error) {
      console.error('[Execution Error]', error.message);
    }
  };

  switch (commandName) {
    case 'os':
      parsedArguments = processArguments(argumentsString, 1, parseOptions);
      await executeCommand(Commands.sysInfo, ...parsedArguments);
      break;

    case 'up':
      Commands.cd('..');
      break;
  
    case 'cd':
      parsedArguments = processArguments(argumentsString, 1, extractPath);
      console.log(parsedArguments);
      let directory = parsedArguments[0];
      if (directory === '~' || !directory) directory = homedir();
      Commands.cd(directory);
      break;
      
    case 'ls':
      parsedArguments = processArguments(argumentsString, 1, extractPath);
      let targetDirectory;
      if (typeof parsedArguments[0] === 'string') {
        if (parsedArguments[0].startsWith('-')) {
          parsedArguments[0] = parseOptions(parsedArguments[0])[0];
        } else {
          targetDirectory = parsedArguments[0];
          parsedArguments.shift();
        }
      } else {
        targetDirectory = resolve(process.cwd());
      }
      await executeCommand(Commands.ls, targetDirectory, ...parsedArguments);
      break;

    case '.exit':
      readlineInterface.close();
      process.exit(0);

    case '':
      break;

    default:
      console.error('Invalid Command:', commandName, '\n');
  }

  return [commandName, parsedArguments];
}

function processArguments(argString, ...argProcessors) {
  const processedArgs = [];
  let remainingString = argString;

  for (let i = 0; i < argProcessors.length; i += 2) {
    const argCount = argProcessors[i];
    const processorFunc = argProcessors[i + 1];

    for (let j = 0; j < argCount; j++) {
      const [processedArg, restOfString] = processorFunc(remainingString);
      if (processedArg && (typeof processedArg === 'object' || processedArg.length)) {
        processedArgs.push(processedArg);
      }
      remainingString = restOfString.trim();
    }
  }

  const additionalArgs = [];
  while (remainingString) {
    const [processedArg, rest] = parseOptions(remainingString);
    additionalArgs.push(processedArg);
    remainingString = rest.trim();
  }

  return [...processedArgs, ...additionalArgs];
}