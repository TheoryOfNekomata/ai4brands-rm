import { writeFile, mkdir } from "fs/promises";
import { join } from 'path';

export interface UploadService {
  uploadFile(file: Buffer, filename: string): Promise<string>;
}

export class UploadServiceImpl implements UploadService {
  constructor(private readonly baseDir = 'public/uploads') {
    // noop
  }


  private async ensureDirectoryExists(path: string) {
    try {
      await mkdir(path, { recursive: true });
    } catch {
      // ignore
    }
  }

  async uploadFile(file: Buffer, filename: string) {
    await this.ensureDirectoryExists(this.baseDir);
    const finalPath = join(this.baseDir, filename);
    await writeFile(finalPath, file);
    return finalPath.replace(/^public/, '');
  }
}
