import { StorageProvider } from "./StorageProvider";

export class StorageService {
  private provider: StorageProvider;

  constructor(provider: StorageProvider) {
    this.provider = provider;
  }

  uploadFile(
    bucketName: string,
    filePath: string,
    content: Buffer
  ): Promise<void> {
    return this.provider.uploadFile(bucketName, filePath, content);
  }

  deleteFile(bucketName: string, fileName: string): Promise<void> {
    return this.provider.deleteFile(bucketName, fileName);
  }

  listFiles(bucketName: string): Promise<string[]> {
    return this.provider.listFiles(bucketName);
  }

  downloadFile(bucketName: string, fileName: string): Promise<Buffer> {
    return this.provider.downloadFile(bucketName, fileName);
  }

  fileExists(bucketName: string, fileName: string): Promise<boolean> {
    return this.provider.fileExists(bucketName, fileName);
  }

  generateSignedUrl(
    bucketName: string,
    fileName: string,
    expiresIn: number
  ): Promise<string> {
    return this.provider.generateSignedUrl(bucketName, fileName, expiresIn);
  }
}
