import axios from "axios";
import { StorageProvider } from "../StorageProvider";

export class BackblazeB2Provider implements StorageProvider {
  private authToken: string;
  private apiUrl: string;
  private applicationKeyId: string;
  private applicationKey: string;

  constructor(applicationKeyId: string, applicationKey: string) {
    this.applicationKeyId = applicationKeyId;
    this.applicationKey = applicationKey;
    this.authToken = "";
    this.apiUrl = "";
  }

  private async authenticate() {
    if (!this.authToken) {
      const response = await axios.get(
        "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
        {
          auth: {
            username: this.applicationKeyId,
            password: this.applicationKey,
          },
        }
      );
      this.authToken = response.data.authorizationToken;
      this.apiUrl = response.data.apiUrl;
    }
  }

  async uploadFile(
    bucketId: string,
    filePath: string,
    content: Buffer
  ): Promise<void> {
    await this.authenticate();
    const uploadUrlResponse = await axios.post(
      `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
      { bucketId },
      {
        headers: { Authorization: this.authToken },
      }
    );
    const uploadUrl = uploadUrlResponse.data.uploadUrl;
    const uploadAuthToken = uploadUrlResponse.data.authorizationToken;
    await axios.post(uploadUrl, content, {
      headers: {
        Authorization: uploadAuthToken,
        "X-Bz-File-Name": filePath,
        "Content-Type": "b2/x-auto",
        "X-Bz-Content-Sha1": "do_not_verify",
      },
    });
  }

  async deleteFile(bucketId: string, fileName: string): Promise<void> {
    await this.authenticate();
    const fileInfoResponse = await axios.post(
      `${this.apiUrl}/b2api/v2/b2_list_file_names`,
      { bucketId, fileName },
      {
        headers: { Authorization: this.authToken },
      }
    );
    const fileId = fileInfoResponse.data.files[0].fileId;
    await axios.post(
      `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
      { fileId, fileName },
      {
        headers: { Authorization: this.authToken },
      }
    );
  }

  async listFiles(bucketId: string): Promise<string[]> {
    await this.authenticate();
    const response = await axios.post(
      `${this.apiUrl}/b2api/v2/b2_list_file_names`,
      { bucketId },
      {
        headers: { Authorization: this.authToken },
      }
    );
    return response.data.files.map((file: any) => file.fileName);
  }

  async downloadFile(bucketId: string, fileName: string): Promise<Buffer> {
    await this.authenticate();
    const response = await axios.post(
      `${this.apiUrl}/b2api/v2/b2_download_file_by_name`,
      { bucketId, fileName },
      {
        headers: { Authorization: this.authToken },
        responseType: "arraybuffer",
      }
    );
    return Buffer.from(response.data);
  }

  async fileExists(bucketId: string, fileName: string): Promise<boolean> {
    await this.authenticate();
    const response = await axios.post(
      `${this.apiUrl}/b2api/v2/b2_list_file_names`,
      { bucketId, fileName },
      {
        headers: { Authorization: this.authToken },
      }
    );
    return response.data.files.length > 0;
  }

  async generateSignedUrl(
    bucketId: string,
    fileName: string,
    expiresIn: number
  ): Promise<string> {
    await this.authenticate();
    const response = await axios.post(
      `${this.apiUrl}/b2api/v2/b2_get_download_authorization`,
      {
        bucketId,
        fileNamePrefix: fileName,
        validDurationInSeconds: expiresIn,
      },
      {
        headers: { Authorization: this.authToken },
      }
    );
    const downloadUrl = `${this.apiUrl}/file/${bucketId}/${fileName}?Authorization=${response.data.authorizationToken}`;
    return downloadUrl;
  }
}
