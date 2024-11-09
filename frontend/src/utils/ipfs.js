import { create } from 'ipfs-http-client';

const IPFS_NODE = {
  host: process.env.REACT_APP_IPFS_HOST || 'localhost',
  port: process.env.REACT_APP_IPFS_PORT || '5001',
  protocol: process.env.REACT_APP_IPFS_PROTOCOL || 'http'
};

let ipfsClient = null;

export const initIPFS = () => {
  try {
    ipfsClient = create(IPFS_NODE);
    return ipfsClient;
  } catch (error) {
    console.error('IPFS initialization error:', error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    if (!ipfsClient) {
      await initIPFS();
    }

    const fileBuffer = await file.arrayBuffer();
    const result = await ipfsClient.add(fileBuffer);
    return result.path;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

export const uploadJSON = async (jsonData) => {
  try {
    if (!ipfsClient) {
      await initIPFS();
    }

    const result = await ipfsClient.add(JSON.stringify(jsonData));
    return result.path;
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    throw error;
  }
};

export const getFile = async (hash) => {
  try {
    if (!ipfsClient) {
      await initIPFS();
    }

    const chunks = [];
    for await (const chunk of ipfsClient.cat(hash)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('IPFS file retrieval error:', error);
    throw error;
  }
};

export const getIPFSUrl = (hash) => {
  return `https://ipfs.io/ipfs/${hash}`;
};