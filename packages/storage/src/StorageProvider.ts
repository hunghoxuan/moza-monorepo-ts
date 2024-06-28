export interface StorageProvider {
  uploadFile(
    bucketName: string,
    filePath: string,
    content: Buffer
  ): Promise<void>;
  deleteFile(bucketName: string, fileName: string): Promise<void>;
  listFiles(bucketName: string): Promise<string[]>;
  downloadFile(bucketName: string, fileName: string): Promise<Buffer>;
  fileExists(bucketName: string, fileName: string): Promise<boolean>;
  generateSignedUrl(
    bucketName: string,
    fileName: string,
    expiresIn: number
  ): Promise<string>;
}
