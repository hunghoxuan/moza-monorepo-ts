import { BlobServiceClient } from "@azure/storage-blob";
import { StorageProvider } from "./StorageProvider";

export class AzureBlobStorageProvider implements StorageProvider {
  private blobServiceClient: BlobServiceClient;

  constructor(connectionString: string) {
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  async uploadFile(
    containerName: string,
    blobName: string,
    content: Buffer
  ): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(content);
  }

  async deleteFile(containerName: string, blobName: string): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  }

  async listFiles(containerName: string): Promise<string[]> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const fileNames: string[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      fileNames.push(blob.name);
    }
    return fileNames;
  }

  async downloadFile(containerName: string, blobName: string): Promise<Buffer> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const downloadedContent = await this.streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody
    );
    return downloadedContent;
  }

  async fileExists(containerName: string, blobName: string): Promise<boolean> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return await blockBlobClient.exists();
  }

  async generateSignedUrl(
    containerName: string,
    blobName: string,
    expiresIn: number
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    const sasUrl = blobClient.generateSasUrl({
      expiresOn: new Date(new Date().valueOf() + expiresIn * 1000),
    });
    return sasUrl;
  }

  private async streamToBuffer(
    readableStream: NodeJS.ReadableStream | null
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream?.on("data", (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream?.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream?.on("error", reject);
    });
  }
}
