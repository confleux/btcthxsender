import pack from "../utils/pack";

const makeGetdataPayload = (id: string, dataType: number) => {
  const count = pack("<b", 1);
  const type = pack("<i", dataType);
  const hash = Buffer.from(id, "hex");

  return Buffer.concat([count, type, hash]);
}

export default makeGetdataPayload;