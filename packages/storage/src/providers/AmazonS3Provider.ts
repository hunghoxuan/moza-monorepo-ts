import { S3 } from "aws-sdk";
import { StorageProvider } from "../StorageProvider";

export class AmazonS3Provider implements StorageProvider {
  private s3: S3;

  constructor() {
    this.s3 = new S3();
  }

  async uploadFile(
    bucketName: string,
    filePath: string,
    content: Buffer
  ): Promise<void> {
    await this.s3
      .upload({
        Bucket: bucketName,
        Key: filePath,
        Body: content,
      })
      .promise();
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: bucketName,
        Key: fileName,
      })
      .promise();
  }

  async listFiles(bucketName: string): Promise<string[]> {
    const result = await this.s3
      .listObjectsV2({
        Bucket: bucketName,
      })
      .promise();
    return result.Contents?.map((item) => item.Key || "") || [];
  }

  async downloadFile(bucketName: string, fileName: string): Promise<Buffer> {
    const result = await this.s3
      .getObject({
        Bucket: bucketName,
        Key: fileName,
      })
      .promise();
    return result.Body as Buffer;
  }

  async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    try {
      await this.s3
        .headObject({
          Bucket: bucketName,
          Key: fileName,
        })
        .promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  async generateSignedUrl(
    bucketName: string,
    fileName: string,
    expiresIn: number
  ): Promise<string> {
    const url = this.s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: fileName,
      Expires: expiresIn,
    });
    return url;
  }
}
