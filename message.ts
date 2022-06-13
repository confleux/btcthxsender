import config from "config";
import pack from "./utils/pack";
import { createHash } from "crypto";

export default class Message {
   #data: Buffer;
   #payload: Buffer;
   #command: string;

   constructor(cmd: string, payload: Buffer) {
     this.#payload = payload;
     this.#command = cmd;

     const magic = pack("<L", config.get("magic"));

     const command = pack("<12s", (cmd + "\0".repeat(12 - cmd.length)));

     const length = pack("<I", payload.length);

     const hash1 = createHash('sha256').update(payload).digest();
     const hash2 = createHash('sha256').update(hash1).digest();
     const checksum = hash2.subarray(0, 4);

     this.#data = Buffer.concat([magic, command, length, checksum, payload]);
   }

    getData(): Buffer {
     return this.#data;
   }
}