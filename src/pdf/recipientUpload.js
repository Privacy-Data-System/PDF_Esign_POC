import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function UploadPdf() {
  const history = useHistory();

  const onFileChange = (event) => {
    event.preventDefault();
    console.log(event, "event");
    // Update the state
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      history.push({
        pathname: "/reciver",
        state: new Uint8Array(reader.result),
      });
    };
  };
  return (
    <div>
      <label for="myfile">Select a file:</label>
      <input
        type="file"
        id="myfile"
        name="myfile"
        onChange={(e) => onFileChange(e)}
      />
    </div>
  );
}

export default UploadPdf;
