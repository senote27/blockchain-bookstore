const IPFS_GATEWAY = 'http://localhost:8080/ipfs/';

export const getIPFSUrl = (cid) => {
    if (!cid) return '';
    return `${IPFS_GATEWAY}${cid}`;
};