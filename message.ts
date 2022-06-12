import config from "config";
import pack from "./utils/pack";
import { createHash } from "crypto";

const makeMessage = (cmd: string, payload: Buffer): Buffer => {
  const magic = pack("<L", config.get("magic"));

  const cmds: string = (cmd + "\0".repeat(12 - cmd.length));
  const command = pack("<12s", cmds);

  const length = pack("<I", payload.length);

  const hash1 = createHash('sha256').update(payload).digest();
  const hash2 = createHash('sha256').update(hash1).digest();
  const check = hash2.subarray(0, 4);

  return Buffer.concat([magic, command, length, check, payload]);
}

export default makeMessage;