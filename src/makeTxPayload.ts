import pack from "../utils/pack";
import { createHash } from "crypto";
import elliptic from "elliptic";

//  @ts-ignore
import base58check from "base58check";

const ec = new elliptic.ec("secp256k1");

interface Tx_in {
  outpoint_hash: Buffer;
  outpoint_index: Buffer;
  script: Buffer;
  script_bytes: Buffer;
  sequence: Buffer;
}

interface Tx_out {
  value: Buffer;
  pk_script: Buffer;
  pk_script_bytes: Buffer;
}

const makeTxPayload = (previous_output: string, receiver_address: string, my_address: string, private_key: string) => {
  const my_hashed_pubkey = base58check.decode(my_address).data.toString("hex");
  const receiver_hashed_pubkey = base58check.decode(receiver_address).data.toString("hex");

  const version = pack("<L", 1);
  const lock_time = pack("<L", 0);
  const hash_code = pack("<L", 1);

  const tx_in_count = pack("<B", 1);
  const script = Buffer.from(`76a914${my_hashed_pubkey}88ac`, "hex");
  const tx_in: Tx_in = {
    outpoint_hash: Buffer.from(previous_output, "hex"),
    outpoint_index: pack("<L", 1),
    script: script,
    script_bytes: pack("<B", script.length),
    sequence: Buffer.from("ffffffff", "hex")
  }

  const tx_out_count = pack("<B", 1);
  const pk_script = Buffer.from(`76a914${receiver_hashed_pubkey}88ac`, "hex");
  const tx_out: Tx_out = {
    value: pack("<Q", 1000),
    pk_script: pk_script,
    pk_script_bytes: pack("<B", pk_script.length)
  }

  const tx_to_sign = Buffer.concat([version,
    tx_in_count, tx_in.outpoint_hash, tx_in.outpoint_index, tx_in.script_bytes, tx_in.script, tx_in.sequence,
    tx_out_count, tx_out.value, tx_out.pk_script_bytes, tx_out.pk_script, lock_time, hash_code
  ]);

  const hash1 = createHash('sha256').update(tx_to_sign).digest();
  const hashed_raw_tx  = createHash('sha256').update(hash1).digest();

  const keyPair = ec.keyFromPrivate(private_key);
  const sk = keyPair.getPrivate();
  const vk = keyPair.getPublic();
  const public_key = vk.encode("hex", false);
  const sign = Buffer.from(ec.sign(hashed_raw_tx, keyPair, "hex", { canonical: true }).toDER());

  const sigscript = Buffer.concat([
    sign,
    Buffer.from("01", "hex"),
    pack("<B", public_key.length),
    Buffer.from(public_key, "hex")
  ]);

  const real_tx = Buffer.concat([
    version,
    tx_in_count,
    tx_in.outpoint_hash,
    tx_in.outpoint_index,
    pack("<B", sigscript.length + 1),
    pack("<B", sign.length + 1),
    sigscript,
    tx_in.sequence,
    tx_out_count,
    tx_out.value,
    tx_out.pk_script_bytes,
    tx_out.pk_script,
    lock_time
  ]);

  return real_tx;
}

export default makeTxPayload;