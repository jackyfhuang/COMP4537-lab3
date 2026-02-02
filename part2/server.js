import http from 'http';
import url from 'url';
import { DateUtils } from './modules/utils.js';
import { EnStrings } from './lang/en/en.js';
import { FileService } from './modules/fileService.js';

class GetDateServer {
  constructor() {
    this.port = process.env.PORT || 8080;
    this.getDatePath = '/COMP4537/labs/3/getDate/';
    this.writeFilePath = '/COMP4537/labs/3/writeFile/';
    this.readFilePathPrefix = '/COMP4537/labs/3/readFile/';
    this.dateUtils = new DateUtils();
    this.enStrings = new EnStrings();
    this.fileService = new FileService('.');
    this.httpServer = http.createServer(this.handleRequest.bind(this));
  }

  async handleRequest(req, res) {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/html' });
      res.end('<p style="color: red;">Method Not Allowed</p>');
      return;
    }

    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    const query = parsed.query;

    // Part B: getDate
    const getDateMatch = this.pathMatches(pathname, this.getDatePath);
    if (getDateMatch) {
      this.handleGetDate(query.name, res);
      return;
    }

    // Part C.1: writeFile - append text to file.txt
    const writeMatch = this.pathMatches(pathname, this.writeFilePath);
    if (writeMatch) {
      await this.handleWriteFile(query.text, res);
      return;
    }

    // Part C.2: readFile - read file and display in browser
    if (pathname.startsWith(this.readFilePathPrefix)) {
      const filename = pathname.slice(this.readFilePathPrefix.length).replace(/^\/+/, '') || 'file.txt';
      await this.handleReadFile(filename, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<p>Not Found</p>');
  }

  pathMatches(pathname, apiPath) {
    return pathname === apiPath || pathname === apiPath.replace(/\/$/, '');
  }

  handleGetDate(name, res) {
    const userName = (name || '').trim() || 'Guest';
    const greeting = this.enStrings.getGreeting();
    const message = `${greeting.replace('%1', userName)} ${this.dateUtils.getDate()}`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<p style="color: blue;">${message}</p>`);
  }

  async handleWriteFile(text, res) {
    const content = (text !== undefined && text !== null) ? String(text) : '';
    try {
      await this.fileService.appendToFile('file.txt', content);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<p>Text appended to file.txt successfully.</p>');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<p>Error writing to file.</p>');
    }
  }

  async handleReadFile(filename, res) {
    if (!filename || filename.includes('..')) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<p>Invalid filename.</p>');
      return;
    }
    try {
      const content = await this.fileService.readFile(filename);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<pre>${GetDateServer.escapeHtml(content)}</pre>`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<p>File not found: ${GetDateServer.escapeHtml(filename)}</p>`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<p>Error reading file.</p>');
      }
    }
  }

  static escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  start() {
    this.httpServer.listen(this.port, () => {
      console.log(`Server running at http://localhost:${this.port}`);
      console.log(`B: http://localhost:${this.port}${this.getDatePath}?name=John`);
      console.log(`C.1: http://localhost:${this.port}${this.writeFilePath}?text=BCIT`);
      console.log(`C.2: http://localhost:${this.port}${this.readFilePathPrefix}file.txt`);
    });
  }
}

// Starter: entry point only
const server = new GetDateServer();
server.start();
