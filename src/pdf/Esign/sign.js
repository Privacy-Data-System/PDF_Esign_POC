import { Button } from '@mui/material';
import React, { useRef } from 'react'
import SignaturePad from "react-signature-canvas";
import "../sigCanvas.css";

const sign = ({setOpenEsign, setImageURL}) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sigCanvas = useRef({});
    const clear = () => sigCanvas.current.clear();
    const save = () => {
        let img = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
        // setImageURL(img);
        // img.length > 0 && pdf.addImageToCanvas(img);
        img?.length > 0 &&  setImageURL(img)
        setOpenEsign(false);
      };
  return (
    <>
    <div>
        <SignaturePad
    ref={sigCanvas}
    canvasProps={{
      className: "signatureCanvas",
    }}
  />
  </div>
  <div>
    <Button onClick={clear}>Clear</Button>
  <Button onClick={save}>Save</Button>
  </div>
  </>
  )
}

export default sign