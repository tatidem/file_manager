function extractPath(inputPath) {
  const space = ' ';
  const doubleQuoted = inputPath.match(/^"([^"]*)"/);
  if (doubleQuoted) return [doubleQuoted[1], inputPath.slice(doubleQuoted[0].length)];

  const singleQuoted = inputPath.match(/^\s'([^']*)'\s/);
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

  switch (commandName) {
    case 'os':
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