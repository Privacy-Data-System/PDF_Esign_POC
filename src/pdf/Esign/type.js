import { Button, TextField } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import Radio from "@mui/material/Radio";
import "./type.css";

// import { createCanvas, loadImage } from "canvas";
// import Canvas from "./Canvas";
// import { generate } from "text-to-image";
// const textToImage = require('text-to-image');

const { createCanvas, loadImage } = require("canvas");
const Type = ({ setImageURL }) => {
  const inputRef = useRef(null);
  const [val, setValue] = useState("");
  const [selectedValue, setSelectedValue] = React.useState("");

  //Font family
  const [italicFont, setItalicFont] = useState("small-caps 30px Verdana");
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    if (event.target.value === "f") {
      setItalicFont("30px Lucida Handwriting");
      inputRef.current.style.font = "30px Lucida Handwriting";
    } else if (event.target.value === "c") {
      setItalicFont("30px Ink Free");
      inputRef.current.style.font = "30px Ink Free";
    } else if (event.target.value === "s") {
      setItalicFont("30px serif");
      inputRef.current.style.font = "30px serif";
    } else if (event.target.value === "cu") {
      setItalicFont("30px cursive");
      inputRef.current.style.font = "30px cursive";
    }
  };
  const canvas = createCanvas(800, 800);
  const ctx = canvas.getContext("2d");
  var generate = function () {
    var text = val?.split("\n").join("\n");
    var x = 20;
    var y = 20;
    var lineheight = 30;
    var lines = text.split("\n");
    var lineLengthOrder = lines.slice(0).sort(function (a, b) {
      return b.length - a.length;
    });
    ctx.canvas.width =
      ctx.measureText(lineLengthOrder[0]).width + 100 + val?.length * 10;
    ctx.canvas.height = lines.length * lineheight * 2;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "middle";
    ctx.font = italicFont;
    ctx.fillStyle = "#000000";
    for (var i = 0; i < lines.length; i++)
      ctx.fillText(lines[i], x, y + i * lineheight);
    // img.src = ctx.canvas.toDataURL();
    setImageURL(ctx.canvas.toDataURL());
    console.log(ctx.canvas.toDataURL(), "Hello");
  };

  return (
    <>
      {/* <div class="container"> */}
      <div className="typeContainer">
        <div className="textCon">
          <TextField
            type="text"
            onChange={(e) => setValue(e.target.value)}
            // className="textCon"
            // style={{ display: "flex", justifyContent: "center" }}
            inputRef={inputRef}
            variant="standard"
            fullWidth
            placeholder="Signature"
          />
          {""}
          <Button style={{ marginLeft: "15px" }} onClick={() => generate()}>
            Save
          </Button>
        </div>

        <br />

        {
          <div className="radioCon">
            <div style={{ marginTop: "20px" }}>
              <Radio
                checked={selectedValue === "s"}
                onChange={handleChange}
                value="s"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />

              <p style={{ font: "30px serif" }}>
                {" "}
                {val?.length === 0 ? <p>Signature</p> : val}
              </p>
            </div>
            <div style={{ marginTop: "20px" }}>
              <Radio
                checked={selectedValue === "c"}
                onChange={handleChange}
                value="c"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />

              <p style={{ font: "30px Ink Free" }}>
                {" "}
                {val?.length === 0 ? <p>Signature</p> : val}
              </p>
            </div>
            <div style={{ marginTop: "100px" }}>
              <Radio
                checked={selectedValue === "f"}
                onChange={handleChange}
                value="f"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />

              <p style={{ font: "30px Lucida Handwriting" }}>
                {" "}
                {val?.length === 0 ? <p>Signature</p> : val}
              </p>
            </div>
            <div style={{ marginTop: "100px" }}>
              <Radio
                checked={selectedValue === "cu"}
                onChange={handleChange}
                value="cu"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />

              <p style={{ font: "30px cursive" }}>
                {val?.length === 0 ? <p>Signature</p> : val}
              </p>
            </div>
          </div>
        }
      </div>
    </>
  );
};

export default Type;
