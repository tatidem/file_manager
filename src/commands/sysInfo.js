import { EOL, cpus, homedir, userInfo, arch, platform } from 'os';

export const sysInfo = async (...options) => {
  const processOptions = options.flatMap(opt => {
    const keys = Object.keys(opt);
    return keys.length ? keys[0].toLowerCase() : '';
  });

  for (const option of processOptions) {
    switch (option) {
      case 'eol':
        console.log('Default system EOL:', JSON.stringify(EOL), '\n');
        break;

      case 'cpus':
        const cpuList = cpus().map((cpu, idx) => ({
          Model: cpu.model,
          'Clock Rate (GHz)': parseFloat((cpu.speed / 1000).toFixed(3))
        }));
        console.table(cpuList);
        console.log();
        break;

      case 'homedir':
        console.log('Home directory:', homedir(), '\n');
        break;

      case 'username':
        console.log('System user:', userInfo().username, '\n');
        break;

      case 'architecture':
        const nodeArch = process.arch;
        const systemArch = arch();
        if (nodeArch === systemArch) {
          console.log('CPU architecture:', nodeArch, '\n');
        } else {
          console.log('Node.js binary architecture:', nodeArch);
          console.log('OS architecture:', systemArch, '\n');
        }
        break;
      default:
        if (option) console.error('Unknown option:', option, '\n');
    }
  }
};