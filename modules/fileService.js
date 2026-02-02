import fs from 'fs/promises';
import path from 'path';

export class FileService {
  constructor(baseDir = '.') {
    this.baseDir = baseDir;
  }

  /**
   * Appends text (plus newline) to a file. Creates the file if it does not exist.
   * @param {string} filename - Name of the file (e.g. 'file.txt')
   * @param {string} text - Text to append
   */
  async appendToFile(filename, text) {
    const filePath = this.resolvePath(filename);
    await fs.appendFile(filePath, text + '\n', 'utf8');
  }

  /**
   * Reads entire content of a file.
   * @param {string} filename - Name of the file (e.g. 'file.txt')
   * @returns {Promise<string>} File content
   * @throws if file does not exist
   */
  async readFile(filename) {
    const filePath = this.resolvePath(filename);
    return await fs.readFile(filePath, 'utf8');
  }

  /**
   * Resolves filename to a path under baseDir. Uses only basename to prevent path traversal.
   */
  resolvePath(filename) {
    const safe = path.basename(path.normalize(filename));
    return path.join(this.baseDir, safe);
  }
}
