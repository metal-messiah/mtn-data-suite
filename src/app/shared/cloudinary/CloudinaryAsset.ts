export class CloudinaryAsset {
  bytes: number;
  created_at: string;
  duration: number;
  format: string;
  height: number;
  public_id: string;
  resource_type: string;
  secure_url: URL;
  tags: string[];
  type: string;
  url: URL;
  version: number;
  width: number;

  constructor(asset) {
    Object.assign(this, asset);
  }
}
