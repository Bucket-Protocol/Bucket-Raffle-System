import type { NextApiRequest, NextApiResponse } from 'next';

import { getDatabase } from '../../utils/db';

import { MerkleTree } from 'merkletreejs';

import {
  sha3_256,
  bytesToHex,
  numToUint8Array,
  calculateHashByIndexAndAddress,
} from '../../utils/hash';

import { ParticipantMerkleTreeLeaf } from '../../utils/type';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const leaves = ['a', 'b', 'c'].map((x) => sha3_256(x));

  // return res.status(200);
  if (req.method === 'POST') {
    const { addresses } = req.body;

    let leafs: ParticipantMerkleTreeLeaf[] = [];
    for (let index = 0; index < addresses.length; index++) {
      let address = addresses[index];
      if (address.startsWith('0x')) {
        address = address.slice(2);
      }
      let hash_output = calculateHashByIndexAndAddress(index, address);
      leafs.push({
        index: index,
        address: address,
        hash: hash_output,
      });
    }
    let tree = new MerkleTree(
      leafs.map((x) => x.hash),
      sha3_256
    );

    let root = tree.getRoot().toString('hex');
    let proof = tree.getProof(leafs[0].hash);
    proof.map((x) => x.data.toString('hex'));
    console.log(leafs[0]);
    console.log(proof.map((x) => x.data.toString('hex')));
    console.log(root);
    console.log(tree.verify(proof, leafs[0].hash, root)); // true
    return;
    let db = await getDatabase();
    let merkleCol = db.collection('MerkleNodes');

    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    try {
      const savedAddresses = await Address.insertMany(addresses);
      return res.status(200).json({
        message: 'Addresses saved successfully',
        addresses: savedAddresses,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: 'An error occurred while saving addresses' });
    }
  }

  return res.status(405).end();
}
