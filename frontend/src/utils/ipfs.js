import { create } from 'ipfs-http-client';

const ipfs = create({
    host: 'localhost',
    port: '5001',
    protocol: 'http',
});

const uploadToIPFS = async (file) => {
    try {
        const added = await ipfs.add(file);
        console.log('IPFS CID:', added.path);
        return added.path;
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error('Failed to upload to IPFS');
    }
};

const getFromIPFS = async (cid) => {
    try {
        const stream = ipfs.cat(cid);
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('IPFS retrieval error:', error);
        throw new Error('Failed to retrieve from IPFS');
    }
};

const testIPFSConnection = async () => {
    try {
        const version = await ipfs.version();
        console.log('IPFS Version:', version);
        return true;
    } catch (error) {
        console.error('IPFS Connection Error:', error);
        return false;
    }
};

export { ipfs, uploadToIPFS, getFromIPFS, testIPFSConnection };