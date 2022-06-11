//  @ts-ignore
import { jspack } from "jspack";
import Long from "long";

const pack = (format: string, value: number | string): Buffer => {
  if (format.includes("Q") && typeof value == "number") {
    const num = Long.fromNumber(value);
    const buf = jspack.Pack(format, [[num.getLowBitsUnsigned(), num.getHighBitsUnsigned()]]);
    return Buffer.from(buf);
  }
  if (format.includes("q") && typeof value == "number") {
    const num = Long.fromNumber(value);
    const buf = jspack.Pack(format, [[num.getLowBits(), num.getHighBits()]]);
    return Buffer.from(buf);
  }

  const buf = jspack.Pack(format, [value]);

  return Buffer.from(buf);
}

export default pack;