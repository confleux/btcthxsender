import * as crypto from "crypto";
import pack from "../utils/pack";

const makeVersionPayload = (): Buffer => {
  const version = pack("<i", 60002);
  const services = pack("<Q", 0);
  const timestamp = pack("<q", Math.floor(Date.now() / 10) / 100);

  const addr_recv = Buffer.concat([
    pack("Q", 0),
    pack(">16s", "127.0.0.1"),
    pack(">H", 8333)
  ]);

  const addr_from = Buffer.concat([
    pack("Q", 0),
    pack(">16s", "127.0.0.1"),
    pack(">H", 8333)
  ]);

  const nonce = crypto.randomBytes(8);
  const user_agent = pack("B", 0);
  const height = pack("i", 0);

  return Buffer.concat([version, services, timestamp, addr_recv, addr_from, nonce, user_agent, height]);
}

export default makeVersionPayload;