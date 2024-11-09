import { create } from 'ipfs-http-client';

class IPFSService {
  constructor() {
    this.ipfs = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Try connecting to local IPFS desktop
      this.ipfs = create({
        host: 'localhost',
        port: '5001',
        protocol: 'http',
        timeout: 10000 // 10 second timeout
      });
      
      // Test connection
      await this.ipfs.id();
      this.isConnected = true;
      console.log('Connected to IPFS Desktop');
      return true;
    } catch (error) {
      console.error('Failed to connect to IPFS Desktop:', error);
      this.isConnected = false;
      throw new Error('Please make sure IPFS Desktop is running');
    }
  }

  async uploadFile(file) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Add progress tracking
      const progressCallback = (progress) => {
        // Emit progress event
        window.dispatchEvent(new CustomEvent('ipfs-upload-progress', {
          detail: {
            fileName: file.name,
            progress: progress
          }
        }));
      };

      // Create file buffer
      const buffer = await file.arrayBuffer();
      
      // Upload with progress tracking
      const added = await this.ipfs.add({
        path: file.name,
        content: buffer
      }, {
        progress: progressCallback,
        pin: true // Ensure file is pinned to IPFS Desktop
      });

      // Verify file is pinned
      await this.ipfs.pin.add(added.cid);

      return {
        hash: added.cid.toString(),
        size: added.size,
        path: added.path
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async downloadFile(hash) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(hash)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('IPFS download failed:', error);
      throw new Error('Failed to download file from IPFS');
    }
  }

  async getPinStatus(hash) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const pins = await this.ipfs.pin.ls({ paths: [hash] });
      return Array.from(pins).length > 0;
    } catch (error) {
      return false;
    }
  }
}

export default new IPFSService();