export interface HttpStatusInfo {
  code: number;
  text: string;
  category: '1xx Informational' | '2xx Success' | '3xx Redirection' | '4xx Client Error' | '5xx Server Error';
  description: string;
  spec: string;
  useCase: string;
}

export const HTTP_STATUS_CODES: HttpStatusInfo[] = [
  // 1xx
  { code: 100, text: 'Continue', category: '1xx Informational', description: 'The server has received the request headers and the client should proceed to send the request body.', spec: 'RFC 9110', useCase: 'Sent in response to an Expect: 100-continue header.' },
  { code: 101, text: 'Switching Protocols', category: '1xx Informational', description: 'The requester has asked the server to switch protocols and the server has agreed to do so.', spec: 'RFC 9110', useCase: 'Upgrading HTTP connection to WebSocket.' },
  { code: 102, text: 'Processing', category: '1xx Informational', description: 'Server has received and is processing the request, but no response is available yet.', spec: 'RFC 2518 (WebDAV)', useCase: 'Prevents client timeout during heavy WebDAV tasks.' },
  { code: 103, text: 'Early Hints', category: '1xx Informational', description: 'Used to return some response headers before final HTTP message.', spec: 'RFC 8297', useCase: 'Preloading critical CSS/JS resources while backend computes response.' },

  // 2xx
  { code: 200, text: 'OK', category: '2xx Success', description: 'Standard response for successful HTTP requests.', spec: 'RFC 9110', useCase: 'Standard REST API GET response returning data.' },
  { code: 201, text: 'Created', category: '2xx Success', description: 'The request has been fulfilled, resulting in the creation of a new resource.', spec: 'RFC 9110', useCase: 'Response to successful POST request creating an entity.' },
  { code: 202, text: 'Accepted', category: '2xx Success', description: 'The request has been accepted for processing, but processing has not been completed.', spec: 'RFC 9110', useCase: 'Queued asynchronous jobs or batch tasks.' },
  { code: 204, text: 'No Content', category: '2xx Success', description: 'Server successfully processed request and is not returning any content.', spec: 'RFC 9110', useCase: 'Response to successful DELETE requests.' },
  { code: 206, text: 'Partial Content', category: '2xx Success', description: 'Server is delivering only part of resource due to Range header sent by client.', spec: 'RFC 9110', useCase: 'Video streaming and resumeable file downloads.' },

  // 3xx
  { code: 301, text: 'Moved Permanently', category: '3xx Redirection', description: 'This and all future requests should be directed to the given URI.', spec: 'RFC 9110', useCase: 'Permanent domain migration or canonical URL redirection.' },
  { code: 302, text: 'Found (Temporary Redirect)', category: '3xx Redirection', description: 'Tells the client to look at another URL temporarily.', spec: 'RFC 9110', useCase: 'Temporary redirect during site maintenance or auth flows.' },
  { code: 304, text: 'Not Modified', category: '3xx Redirection', description: 'Indicates resource has not been modified since version specified by request headers.', spec: 'RFC 9110', useCase: 'Browser cache revalidation using ETag or If-Modified-Since.' },
  { code: 307, text: 'Temporary Redirect', category: '3xx Redirection', description: 'The request should be repeated with another URI; however, future requests should still use original URI.', spec: 'RFC 9110', useCase: 'Preserves request method (e.g. POST remains POST).' },
  { code: 308, text: 'Permanent Redirect', category: '3xx Redirection', description: 'Request and all future requests should be repeated using another URI, preserving HTTP method.', spec: 'RFC 9110', useCase: 'Permanent redirect preserving POST/PUT methods.' },

  // 4xx
  { code: 400, text: 'Bad Request', category: '4xx Client Error', description: 'Server cannot or will not process request due to an apparent client error.', spec: 'RFC 9110', useCase: 'Malformed JSON payload or invalid query parameters.' },
  { code: 401, text: 'Unauthorized', category: '4xx Client Error', description: 'Authentication is required and has failed or has not yet been provided.', spec: 'RFC 9110', useCase: 'Missing or expired Bearer token / API key.' },
  { code: 403, text: 'Forbidden', category: '4xx Client Error', description: 'Request was valid, but server is refusing action. The user might not have necessary permissions.', spec: 'RFC 9110', useCase: 'Authenticated user lacks admin role for resource.' },
  { code: 404, text: 'Not Found', category: '4xx Client Error', description: 'The requested resource could not be found but may be available in the future.', spec: 'RFC 9110', useCase: 'Route does not exist or database record not found.' },
  { code: 405, text: 'Method Not Allowed', category: '4xx Client Error', description: 'Request method is not supported for requested resource.', spec: 'RFC 9110', useCase: 'Sending PUT or DELETE to a GET-only endpoint.' },
  { code: 408, text: 'Request Timeout', category: '4xx Client Error', description: 'Server timed out waiting for the request.', spec: 'RFC 9110', useCase: 'Client took too long sending body payload.' },
  { code: 409, text: 'Conflict', category: '4xx Client Error', description: 'Indicates request could not be processed because of conflict in current state of resource.', spec: 'RFC 9110', useCase: 'Duplicate email registration or concurrent update conflict.' },
  { code: 413, text: 'Payload Too Large', category: '4xx Client Error', description: 'Request entity is larger than limits defined by server.', spec: 'RFC 9110', useCase: 'Uploading a 50MB file when endpoint limit is 10MB.' },
  { code: 415, text: 'Unsupported Media Type', category: '4xx Client Error', description: 'Payload format is in an unsupported format.', spec: 'RFC 9110', useCase: 'Sending application/xml to an API expecting application/json.' },
  { code: 422, text: 'Unprocessable Content', category: '4xx Client Error', description: 'Request was well-formed but was unable to be followed due to semantic errors.', spec: 'RFC 9110', useCase: 'Form validation failure (e.g. invalid email format).' },
  { code: 429, text: 'Too Many Requests', category: '4xx Client Error', description: 'The user has sent too many requests in a given amount of time (rate limiting).', spec: 'RFC 6585', useCase: 'Exceeding API quota (paired with Retry-After header).' },

  // 5xx
  { code: 500, text: 'Internal Server Error', category: '5xx Server Error', description: 'Generic error message given when an unexpected condition was encountered and no more specific message is suitable.', spec: 'RFC 9110', useCase: 'Unhandled exception or crash in backend code.' },
  { code: 502, text: 'Bad Gateway', category: '5xx Server Error', description: 'Server, while acting as gateway or proxy, received invalid response from inbound server.', spec: 'RFC 9110', useCase: 'Nginx proxy cannot reach upstream Node/Python application.' },
  { code: 503, text: 'Service Unavailable', category: '5xx Server Error', description: 'Server cannot handle request (because it is overloaded or down for maintenance).', spec: 'RFC 9110', useCase: 'Database down or deployment in progress.' },
  { code: 504, text: 'Gateway Timeout', category: '5xx Server Error', description: 'Server acting as gateway or proxy did not receive timely response from upstream server.', spec: 'RFC 9110', useCase: 'Upstream microservice took longer than proxy timeout.' },
];

export interface MimeTypeInfo {
  extension: string;
  mimeType: string;
  category: string;
  description: string;
}

export const MIME_TYPES: MimeTypeInfo[] = [
  { extension: 'json', mimeType: 'application/json', category: 'Application', description: 'JavaScript Object Notation' },
  { extension: 'html', mimeType: 'text/html', category: 'Text', description: 'HyperText Markup Language' },
  { extension: 'css', mimeType: 'text/css', category: 'Text', description: 'Cascading Style Sheets' },
  { extension: 'js', mimeType: 'text/javascript', category: 'Text', description: 'JavaScript file' },
  { extension: 'mjs', mimeType: 'text/javascript', category: 'Text', description: 'JavaScript module' },
  { extension: 'ts', mimeType: 'text/plain', category: 'Text', description: 'TypeScript file' },
  { extension: 'csv', mimeType: 'text/csv', category: 'Text', description: 'Comma-Separated Values' },
  { extension: 'xml', mimeType: 'application/xml', category: 'Application', description: 'Extensible Markup Language' },
  { extension: 'png', mimeType: 'image/png', category: 'Image', description: 'Portable Network Graphics' },
  { extension: 'jpg', mimeType: 'image/jpeg', category: 'Image', description: 'JPEG image' },
  { extension: 'jpeg', mimeType: 'image/jpeg', category: 'Image', description: 'JPEG image' },
  { extension: 'svg', mimeType: 'image/svg+xml', category: 'Image', description: 'Scalable Vector Graphics' },
  { extension: 'webp', mimeType: 'image/webp', category: 'Image', description: 'WebP image' },
  { extension: 'gif', mimeType: 'image/gif', category: 'Image', description: 'Graphics Interchange Format' },
  { extension: 'ico', mimeType: 'image/x-icon', category: 'Image', description: 'Icon format' },
  { extension: 'pdf', mimeType: 'application/pdf', category: 'Application', description: 'Adobe Portable Document Format' },
  { extension: 'zip', mimeType: 'application/zip', category: 'Archive', description: 'ZIP archive' },
  { extension: 'tar', mimeType: 'application/x-tar', category: 'Archive', description: 'Tape Archive' },
  { extension: 'gz', mimeType: 'application/gzip', category: 'Archive', description: 'GZip archive' },
  { extension: 'mp3', mimeType: 'audio/mpeg', category: 'Audio', description: 'MP3 audio' },
  { extension: 'wav', mimeType: 'audio/wav', category: 'Audio', description: 'Waveform Audio File Format' },
  { extension: 'mp4', mimeType: 'video/mp4', category: 'Video', description: 'MP4 video' },
  { extension: 'webm', mimeType: 'video/webm', category: 'Video', description: 'WebM video' },
  { extension: 'woff', mimeType: 'font/woff', category: 'Font', description: 'Web Open Font Format' },
  { extension: 'woff2', mimeType: 'font/woff2', category: 'Font', description: 'Web Open Font Format 2' },
  { extension: 'ttf', mimeType: 'font/ttf', category: 'Font', description: 'TrueType Font' },
  { extension: 'otf', mimeType: 'font/otf', category: 'Font', description: 'OpenType Font' },
  { extension: 'wasm', mimeType: 'application/wasm', category: 'Application', description: 'WebAssembly binary' },
];

export interface ParsedUserAgent {
  browser: { name: string; version: string };
  os: { name: string; version: string };
  engine: { name: string; version: string };
  device: { type: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown'; model?: string };
}

export function parseUserAgent(ua: string): ParsedUserAgent {
  const result: ParsedUserAgent = {
    browser: { name: 'Unknown', version: '' },
    os: { name: 'Unknown', version: '' },
    engine: { name: 'Unknown', version: '' },
    device: { type: 'Desktop' },
  };

  if (!ua) return result;

  // OS detection
  if (/Windows NT 10.0/i.test(ua)) result.os = { name: 'Windows', version: '10 / 11' };
  else if (/Windows NT 6.3/i.test(ua)) result.os = { name: 'Windows', version: '8.1' };
  else if (/Windows NT 6.1/i.test(ua)) result.os = { name: 'Windows', version: '7' };
  else if (/Mac OS X (\d+[._]\d+)/i.test(ua)) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/i);
    result.os = { name: 'macOS', version: match ? match[1].replace(/_/g, '.') : '' };
  } else if (/Android (\d+(\.\d+)?)/i.test(ua)) {
    const match = ua.match(/Android (\d+(\.\d+)?)/i);
    result.os = { name: 'Android', version: match ? match[1] : '' };
    result.device.type = 'Mobile';
  } else if (/iPhone OS (\d+[._]\d+)/i.test(ua)) {
    const match = ua.match(/iPhone OS (\d+[._]\d+)/i);
    result.os = { name: 'iOS', version: match ? match[1].replace(/_/g, '.') : '' };
    result.device.type = 'Mobile';
  } else if (/iPad.*OS (\d+[._]\d+)/i.test(ua)) {
    const match = ua.match(/OS (\d+[._]\d+)/i);
    result.os = { name: 'iPadOS', version: match ? match[1].replace(/_/g, '.') : '' };
    result.device.type = 'Tablet';
  } else if (/Linux/i.test(ua)) {
    result.os = { name: 'Linux', version: '' };
  }

  // Engine
  if (/AppleWebKit\/(\d+(\.\d+)?)/i.test(ua)) {
    const m = ua.match(/AppleWebKit\/(\d+(\.\d+)?)/i);
    result.engine = { name: 'WebKit', version: m ? m[1] : '' };
  } else if (/Gecko\/(\d+)/i.test(ua)) {
    result.engine = { name: 'Gecko', version: '' };
  }

  // Browser
  if (/Edg\/(\d+(\.\d+)?)/i.test(ua)) {
    const m = ua.match(/Edg\/(\d+(\.\d+)?)/i);
    result.browser = { name: 'Microsoft Edge', version: m ? m[1] : '' };
  } else if (/Chrome\/(\d+(\.\d+)?)/i.test(ua) && !/Chromium/i.test(ua)) {
    const m = ua.match(/Chrome\/(\d+(\.\d+)?)/i);
    result.browser = { name: 'Google Chrome', version: m ? m[1] : '' };
  } else if (/Firefox\/(\d+(\.\d+)?)/i.test(ua)) {
    const m = ua.match(/Firefox\/(\d+(\.\d+)?)/i);
    result.browser = { name: 'Mozilla Firefox', version: m ? m[1] : '' };
  } else if (/Safari\/(\d+(\.\d+)?)/i.test(ua) && !/Chrome/i.test(ua)) {
    const m = ua.match(/Version\/(\d+(\.\d+)?)/i);
    result.browser = { name: 'Apple Safari', version: m ? m[1] : '' };
  } else if (/bot|crawler|spider|crawling/i.test(ua)) {
    result.device.type = 'Bot';
    result.browser = { name: 'Bot/Crawler', version: '' };
  }

  return result;
}

export function formatHtml(html: string, indentSize = 2): string {
  if (!html.trim()) return '';

  let formatted = '';
  let indent = 0;
  const pad = ' '.repeat(indentSize);

  // Clean tags
  const tokens = html.replace(/>\s*</g, '><').match(/(<[^>]+>|[^<]+)/g) || [];

  for (const token of tokens) {
    if (!token.trim()) continue;

    // Closing tag
    if (/^<\/[^>]+>/.test(token)) {
      indent = Math.max(0, indent - 1);
      formatted += pad.repeat(indent) + token.trim() + '\n';
    }
    // Self-closing or void tag (meta, link, img, br, hr, input)
    else if (/^<[^>]+\/>$/.test(token) || /^<(meta|link|img|br|hr|input)[^>]*>$/i.test(token) || /^<!/.test(token)) {
      formatted += pad.repeat(indent) + token.trim() + '\n';
    }
    // Opening tag
    else if (/^<[^\/][^>]*>$/.test(token)) {
      formatted += pad.repeat(indent) + token.trim() + '\n';
      indent++;
    }
    // Text content
    else {
      formatted += pad.repeat(indent) + token.trim() + '\n';
    }
  }

  return formatted.trim();
}

export function formatXml(xml: string, indentSize = 2): string {
  if (!xml.trim()) return '';

  // Validate XML using browser DOMParser
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'application/xml');
  const parserError = xmlDoc.getElementsByTagName('parsererror');

  if (parserError.length > 0) {
    const errText = parserError[0].textContent || 'Malformed XML document';
    throw new Error(`XML Syntax Error: ${errText.split('\n')[0]}`);
  }

  // Format with indentation
  let formatted = '';
  let indent = 0;
  const pad = ' '.repeat(indentSize);

  const tokens = xml.replace(/>\s*</g, '><').match(/(<[^>]+>|[^<]+)/g) || [];

  for (const token of tokens) {
    if (!token.trim()) continue;

    if (/^<\/[^>]+>/.test(token)) {
      indent = Math.max(0, indent - 1);
      formatted += pad.repeat(indent) + token.trim() + '\n';
    } else if (/^<[^>]+\/>$/.test(token) || /^<\?xml/i.test(token) || /^<!--/.test(token)) {
      formatted += pad.repeat(indent) + token.trim() + '\n';
    } else if (/^<[^\/][^>]*>$/.test(token)) {
      formatted += pad.repeat(indent) + token.trim() + '\n';
      indent++;
    } else {
      formatted += pad.repeat(indent) + token.trim() + '\n';
    }
  }

  return formatted.trim();
}
