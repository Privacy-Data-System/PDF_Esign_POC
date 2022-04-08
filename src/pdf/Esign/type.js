import { Button } from "@mui/material";
import React, { useState } from "react";
// import { generate } from "text-to-image";
// const textToImage = require('text-to-image');

const Type = ({ setImageURL }) => {
  const [sign, setSign] = useState();
  const generateSign = async () => {
    // const dataUri = textToImage.generateSync(sign);
    // dataUri?.length > 0 && setImageURL(dataUri);
  };
  return (
    <>
      <div>
        <input
          type="text"
          placeholder="Signature"
          onChange={(e) => setSign(e.target.value)}
        />
        <Button onClick={generateSign}>Save</Button>
      </div>
    </>
  );
};

export default Type;
