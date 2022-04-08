import { Button } from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import Radio from "@mui/material/Radio";
import "./type.css";
// import { createCanvas, loadImage } from "canvas";
// import Canvas from "./Canvas";
// import { generate } from "text-to-image";
// const textToImage = require('text-to-image');

const { createCanvas, loadImage } = require("canvas");
const Type = ({ setImageURL }) => {
  const [val, setValue] = useState("");
  const [selectedValue, setSelectedValue] = React.useState("");

  //Font family
  const [italicFont, setItalicFont] = useState("");
  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    if (event.target.value === "f") {
      setItalicFont("fantasy");
    } else if (event.target.value === "c") {
      setItalicFont("cursive");
    } else if (event.target.value === "s") {
      setItalicFont("serif");
    }
  };
  const canvas = createCanvas(1000, 1000);
  const ctx = canvas.getContext("2d");
  var generate = function () {
    var text = val?.split("\n").join("\n");
    var x = 12.5;
    var y = 15;
    var lineheight = 30;
    var lines = text.split("\n");
    var lineLengthOrder = lines.slice(0).sort(function (a, b) {
      return b.length - a.length;
    });
    ctx.canvas.width = ctx.measureText(lineLengthOrder[0]).width + 25;
    ctx.canvas.height = lines.length * lineheight;

    ctx.fillStyle = "#232323";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "middle";
    ctx.font = "20px Anonymous Pro";
    ctx.fillStyle = "#BBBBBB";
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
        <input
          type="text"
          onChange={(e) => setValue(e.target.value)}
          className="text"
          style={{ fontFamily: italicFont }}
        />
        <button onClick={() => generate()}>Save</button>
        <br />

        {val?.length > 0 && (
          <div>
            <div>
              <Radio
                checked={selectedValue === "s"}
                onChange={handleChange}
                value="s"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />

              <p style={{ fontFamily: "serif" }}>{val}</p>
            </div>
            <div>
              <Radio
                checked={selectedValue === "c"}
                onChange={handleChange}
                value="c"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />

              <p style={{ fontFamily: "cursive" }}>{val}</p>
            </div>
            <div>
              <Radio
                checked={selectedValue === "f"}
                onChange={handleChange}
                value="f"
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />

              <p style={{ fontFamily: "fantasy" }}>{val}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Type;
