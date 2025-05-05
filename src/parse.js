import { resolve  } from 'path';
import * as Commands from './commands/index.js';
import { fileExist } from './utils/fileExist.js';

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
    const trimmed = inputString.trim();
    const commandStart = trimmed.search(/\S/);
    const commandEnd = trimmed.indexOf(' ', commandStart);
    
    if (commandEnd === -1) {
      return [trimmed.slice(commandStart), ''];
    }
    
    const commandName = trimmed.slice(commandStart, commandEnd);
    const argumentsString = trimmed.slice(commandEnd).trimStart();
    
    return [commandName, argumentsString];
  };

  const [commandName, argumentsString] = extractCommand(userInput);
  let parsedArguments;

  const executeCommand = async (action, ...params) => {
    try {
      await action(...params);
    } catch (error) {
      console.error('Execution Error', error.message);
    }
  };

  const handlePathArgument = async (pathArg, optionsArg) => {
    if (pathArg) {
      const exists = await fileExist(pathArg);
      if (!exists) {
        const options = parseOptions(optionsArg || pathArg)[0];
        if (Object.keys(options).length) return ['', options];
      }
    }
    return [pathArg, optionsArg];
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
    
    case 'cat':
    case 'add':
    case 'mkdir':
    case 'rm':
      parsedArguments = processArguments(argumentsString, 1, extractPath);
      await executeCommand(Commands[commandName], parsedArguments[0], readlineInterface);
      break;
    
    case 'rn':
    case 'cp':
    case 'mv':
      parsedArguments = processArguments(argumentsString, 2, extractPath);
      await executeCommand(Commands[commandName], ...parsedArguments);
      break;
    
    case 'hash':
      parsedArguments = processArguments(argumentsString, 1, extractPath);
      const [hashPath, hashOptions] = await handlePathArgument(...parsedArguments);
      await executeCommand(
        Commands.hash,
        ...[hashPath, hashOptions].map(arg => 
          typeof arg === 'object' ? Object.keys(arg)[0] : arg
        )
      );
      break;

    case 'compress':
    case 'decompress':
      parsedArguments = processArguments(argumentsString, 2, extractPath);
      let compressionType = 'br';
      if (!parsedArguments[1]) parsedArguments[1] = '';
      if (parsedArguments[2]) {
        compressionType = typeof parsedArguments[2] === 'object'
          ? String(Object.keys(parsedArguments[2])[0])
          : parsedArguments[2].trim();
      }
      await executeCommand(
        Commands.brotli,
        parsedArguments[0],
        parsedArguments[1],
        compressionType,
        commandName
      );
      break;

    case '.exit':
      readlineInterface.close();
      process.exit(0);

    case '':
      break;

    default:
      console.error('Invalid input:', commandName, '\n');
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