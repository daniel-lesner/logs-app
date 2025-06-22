const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('output messages', () => {
  const logPath = path.join(__dirname, 'logs.log');

  beforeAll(() => {
    fs.writeFileSync(
      logPath,
      `
10:00:00,JobA,START,1001
10:00:01,JobA,END,1001
10:00:00,JobB,START,1002
10:05:01,JobB,END,1002
10:00:00,JobC,START,1003
10:10:01,JobC,END,1003
`.trim()
    )
  });

  afterAll(() => {
    fs.unlinkSync(logPath);
  });

  test('show warnings and errors for long jobs', () => {
    const output = execSync('node index.js', { encoding: 'utf8' });

    // When running the script, we get correct output messages for jobs with id 1002 and 1003,
    // while for 1001 id we get no message
    expect(output).not.toMatch(/1001/);
    expect(output).toContain('Job with id 1002 has an warning');
    expect(output).toContain('Job with id 1003 has an error');
  });
});