import handler from "./api/index.js";

const mockReq = {
  method: "POST",
  headers: {
    "payment-signature": "0xd55b22253fa5e1ff3bc5d85dc6b56774c430e3a6394a1515d5636b9c157fccba"
  },
  body: {
    targetAddress: "0xcd339078d159404d29000a6716d962c8833abfe8"
  }
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log(`[${code}]`, JSON.stringify(data, null, 2));
      return { status: code, end: () => {} };
    },
    end: () => {}
  }),
  setHeader: () => {}
};

handler(mockReq, mockRes).catch(console.error);
