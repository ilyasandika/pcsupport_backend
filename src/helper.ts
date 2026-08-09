import fs from 'node:fs';
import path from 'node:path';

export const formatTicketDateTime = (dateString: Date | string) => {
  if (!dateString || dateString === '-') {
    return { date: '-', time: '-' };
  }

  const dateObj = new Date(dateString);

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);

  const formattedTime = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(dateObj)
    .replace('.', ':');

  return {
    date: formattedDate,
    time: `${formattedTime}`,
  };
};

interface SignatureResult {
  data: Buffer;
  extension: '.png' | '.jpg' | '.jpeg' | '.gif' | '.svg';
}

export const getSignatureBuffer = (
  relativePath?: string | null,
): SignatureResult => {
  // Fallback 1x1 Transparent PNG
  const fallBackResult: SignatureResult = {
    data: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    ),
    extension: '.png',
  };

  if (!relativePath) {
    return fallBackResult;
  }

  const absolutePath = path.join(process.cwd(), relativePath);

  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    const ext = path
      .extname(absolutePath)
      .toLowerCase() as SignatureResult['extension'];

    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
    if (validExtensions.includes(ext)) {
      return {
        data: fs.readFileSync(absolutePath),
        extension: ext,
      };
    }
  }

  return fallBackResult;
};
