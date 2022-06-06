import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const PROXY_URL = "https://cors-anywhere.herokuapp.com/"
  const BASE_URL = "https://au.account.assuresign.net/api/v3.7";
  const [token, setToken] = useState("");
  const [url, setUrl] = useState("")
  const [file, setFile] = useState()
  const blobToData = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };
  const prepareEnvelope = async () => {
    const formData = new  FormData()
    formData.append("token", token)
    const blobData = await blobToData(file)
    formData.append("file", blobData)

    // const payload = {
    //   "token": token,
       
    // };
    axios
      .post("http://localhost:5001/prepare", formData)
      .then((res) => {
        console.log(res)
        setUrl(res.data.siteUrl)
      });
  };
  useEffect(() => {
    if (token) {
      prepareEnvelope();
    }
  }, [token]);
  // const BASE_URL = "https://au.assuresign.net/api/documentnow/v3.7";
  const handleAuthenticateUser = () => {
    axios
      .post(
        // PROXY_URL + BASE_URL + "/authentication/apiUser",
        "http://localhost:5001/authenticateUser",
        {
          request: {
                apiUsername: "saimaheshwar_Fg03GXnt",
                key: "Y8B3biOxv5eE5eB1aFzt0Ony1TZ9jBX0",
                contextUsername: "saimaheshwar.reddy@cashapona.com",
                sessionLengthInMinutes: 60,
              },
        }
      )
      .then((res) => {
        setToken(res.data.result.token);
        console.log(res.data.result.token, "res");
      });
  };
  return <>
  <input type="file" onChange={(e) => {
    console.log(e.target.files)
    setFile(e.target.files[0])
  }} />
  <br />
  <br />
  <button onClick={() => handleAuthenticateUser()}>Get eSign url</button>
{url ? <a href={url} target="_blank" rel="noreferrer">assure sign</a> : null}
{/* {url ? <iframe src={url} title="assure sign" height="90px" width="40px"></iframe>
 : null} */}

</>
}

export default App;
