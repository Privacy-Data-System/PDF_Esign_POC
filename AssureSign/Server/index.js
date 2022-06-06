const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const BASE_URL = "https://au-account.assuresign.net/api/v3.7";
const multer = require("multer");
app.use(cors());
const upload = multer({
    limits: { fieldSize: 300 * 1024 * 1024 },
  });
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.post("/authenticateUser", async (req, res) => {
  const { apiUsername, key, contextUsername, sessionLengthInMinutes } =
    req.body.request;
  const response = await axios.post(BASE_URL + "/authentication/apiUser", {
    request: {
      apiUsername: apiUsername,
      key: key,
      contextUsername: contextUsername,
      sessionLengthInMinutes: sessionLengthInMinutes,
    },
  });

  res.status(200).json(response.data);
});

app.post("/prepare", upload.single("file"),  async (req, res) => {
    // console.log(req);
  const payload = {
    request: {
      content: {
        documents: [
          {
            file: {
              fileToUpload: {
                data: `${req.body.file.replace(/data:application\/pdf\;base64\,/gi, "")}`,
                fileName: "Example.pdf",
                parseDocument: false,
              },
              extension: "pdf",
            },
            name: "document 1",
          },
        ],
      },
    },
  };
  try {
      // console.log(JSON.stringify(payload), "payload")
    const response = await axios.post(
      "https://au.assuresign.net/api/documentnow/v3.7" + "/submit/prepare",
      payload,
      {
        headers: {
          //   "Host": "www.assuresign.net",
          "Content-Type": "application/json",
          Authorization: `bearer ${req.body.token}`,
          "X-AS-UserContext":
            "saimaheshwar.reddy@cashapona.com:c0bf8e19-94b0-4e5d-8ade-a0e86082a191",
        },
      }
    );
    const ssoToken = await axios.post(
      "https://au.assuresign.net/api/documentnow/v3.7/authentication/sso",
      {},
      {
        headers: {
          Authorization: `bearer ${req.body.token}`,
          "X-AS-UserContext":
            "saimaheshwar.reddy@cashapona.com:c0bf8e19-94b0-4e5d-8ade-a0e86082a191",
        },
      }
    );
    // console.log(ssoToken.data.result.ssoToken);s

    // console.log(response.data);
    const sso = ssoToken.data.result.ssoToken;
    const preparedEnvelopeID = response.data.result.preparedEnvelopeID;
    const url = `https://au.assuresign.net/ui/simpleSetup/${preparedEnvelopeID}?ssoToken=${sso}
      `;
    res.status(200).json({ siteUrl: url });
  } catch (err) {
    console.log(err);
  }
});

app.listen(5001, () => {
  console.log("listening to port 5001");
});
