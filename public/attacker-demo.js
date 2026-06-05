const liveFeed = document.querySelector('#liveTerminalFeed');

const fakeLogLines = [
  'boot sequence initialized',
  'loading terminal profile...',
  'routing capture buffer...',
  'monitoring login session...',
  'packet received',
  'decoding payload...',
  'parsing form fields...',
  'extracting identifier...',
  'extracting access key...',
  'writing output...',
  'session output complete',
  'standby mode active'
];

let nextLineIndex = 0;

function appendFakeLogLine() {
  if (!liveFeed) {
    return;
  }

  const line = document.createElement('p');
  const prompt = document.createElement('span');

  prompt.textContent = '>';
  line.append(prompt, ` ${fakeLogLines[nextLineIndex]}`);
  liveFeed.append(line);
  nextLineIndex = (nextLineIndex + 1) % fakeLogLines.length;

  while (liveFeed.children.length > 18) {
    liveFeed.removeChild(liveFeed.firstElementChild);
  }

  liveFeed.scrollTop = liveFeed.scrollHeight;
}

window.setInterval(appendFakeLogLine, 820);
