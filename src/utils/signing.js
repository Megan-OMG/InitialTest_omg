import { KEYUTIL, KJUR } from "jsrsasign";

export function signTransaction(
  privateKeyPem,
  fromAddress,
  toAddress,
  amount,
  timestamp,
) {
  const message = `${fromAddress}${toAddress}${amount}${timestamp}`;

  const md = new KJUR.crypto.MessageDigest({ alg: "sha256", prov: "cryptojs" });
  md.updateString(message);
  const hashHex = md.digest(); // matches calculateHash() on backend

  const key = KEYUTIL.getKey(privateKeyPem);
  const sig = new KJUR.crypto.Signature({ alg: "SHA256withECDSA" });
  sig.init(key);
  sig.updateString(hashHex); // sign the hex string, not the raw message
  return sig.sign();
}
