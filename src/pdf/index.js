import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import "./pdf.css";
import sample from "./sample.pdf";
import SignaturePad from "react-signature-canvas";
import Popup from "reactjs-popup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Buffer } from "buffer";
import "./sigCanvas.css";
import { Button } from "@material-ui/core";
import BasicTabs from "./eSingnature";
import { PDFDocument, PDFName, PDFHexString } from "pdf-lib";
const download = require("downloadjs");

var pdf;
var rect;
var esigngroup = {};
var signfabricObj = {};
var left = {},
  top = {};
var eleHeight = {},
  eleWidth = {};
var pdf2;
var a;
function Annotation() {
  const [signsAdd, setSignsAdd] = useState(false);
  const [pencilTool, setPencilTool] = useState();
  const [selectedMail, setSelectedMail] = useState("");
  const [openSignPad, setopenSignPad] = useState(false);
  const [openEsign, setOpenEsign] = useState(false);
  const [imageURL, setImageURL] = useState(null); // create a state that will contain our image url
  const sigCanvas = useRef({});
  console.log(imageURL, "img");
  const fetchD = fetch(imageURL)
    .then((data) => {
      // console.log(data.blob(), " data");
      return data.blob();
    })
    .then((res) => window.URL.createObjectURL(new Blob([res])));
  // console.log(fetchD, "fetchD");
  let fabric = window.fabric;
  const clear = () => sigCanvas.current.clear();
  const closeModal = () => {
    // console.log("triggers");
    setopenSignPad(false);
    // console.log(openSignPad, ":openSignPad");
  };
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setOpenEsign(false);
    // console.log(imageURL?.length, ":imageURL?.length");
  };
  const { state: pdfUrl } = location || {};

  // const [statePdfUrl, setStatePdfUrl] = useState(pdfUrl);
  useEffect(() => {
    (async () => {
      const emblemUrl = "https://pdf-lib.js.org/assets/mario_emblem.png";
      const emblemImageBytes = await fetch(emblemUrl).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(pdfUrl);
      const emblemImage = await pdfDoc.embedPng(emblemImageBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // const page = pdfDoc.addPage([550, 750])

      // Get the form so we can add fields to it
      const form = pdfDoc.getForm();
      const button = form.createButton("cool");

      // const field = form.getField("favorite.superhero");
      // field.disableReadOnly();
      // const superheroField = form.createTextField("favorite.superhero");
      // superheroField.setText("One Punch Man");
      // superheroField.addToPage(firstPage, { x: 55, y: 640 });
      button.addToPage("content", pages[0], {
        x: 80,
        y: 540,
      });
      // button.setImage(emblemImage);
      // const helloWorldScript =
      //   'console.show(); console.println("Hello World!");';
      // button.acroField.getWidgets().forEach((widget) => {
      //   widget.dict.set(
      //     PDFName.of("AA"),
      //     pdfDoc.context.obj({
      //       U: {
      //         Type: "Action",
      //         S: "JavaScript",
      //         JS: PDFHexString.fromText(helloWorldScript),
      //       },
      //     })
      //   );
      // });
      // const checkBox = form.getCheckBox("gundam.exia");
      // if (checkBox.isChecked()) console.log("check box is selected");

      const pdfBytes = await pdfDoc.save();
      // const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
      // setTimeout(() => {
      //   download(
      //     pdfBytes,
      //     "pdf-lib_form_creation_example.pdf",
      //     "application/pdf"
      //   );
      // }, 5000);
    })();
  }, []);
  //Fabric Arrow Script //
  fabric.LineArrow = fabric.util.createClass(fabric.Line, {
    type: "lineArrow",
    initialize: function (element, options) {
      options || (options = {});
      this.callSuper("initialize", element, options);
    },

    toObject: function () {
      return fabric.util.object.extend(this.callSuper("toObject"));
    },

    _render: function (ctx) {
      this.callSuper("_render", ctx);

      // do not render if width/height are zeros or object is not visible
      if (this.width === 0 || this.height === 0 || !this.visible) return;

      ctx.save();

      var xDiff = this.x2 - this.x1;
      var yDiff = this.y2 - this.y1;
      var angle = Math.atan2(yDiff, xDiff);
      ctx.translate((this.x2 - this.x1) / 2, (this.y2 - this.y1) / 2);
      ctx.rotate(angle);
      ctx.beginPath();
      //move 10px in front of line to start the arrow so it does not have the square line end showing in front (0,0)
      ctx.moveTo(10, 0);
      ctx.lineTo(-20, 15);
      ctx.lineTo(-20, -15);
      ctx.closePath();
      ctx.fillStyle = this.stroke;
      ctx.fill();

      ctx.restore();
    },
  });
  fabric.LineArrow.fromObject = function (object, callback) {
    callback &&
      callback(
        new fabric.LineArrow(
          [object.x1, object.y1, object.x2, object.y2],
          object
        )
      );
  };

  fabric.LineArrow.async = true;
  var Arrow = (function () {
    function Arrow(canvas, color, callback) {
      this.canvas = canvas;
      this.className = "Arrow";
      this.isDrawing = false;
      this.color = color;
      this.callback = callback;
      this.bindEvents();
    }

    Arrow.prototype.bindEvents = function () {
      var inst = this;
      inst.canvas.on("mouse:down", function (o) {
        inst.onMouseDown(o);
      });
      inst.canvas.on("mouse:move", function (o) {
        inst.onMouseMove(o);
      });
      inst.canvas.on("mouse:up", function (o) {
        inst.onMouseUp(o);
      });
      inst.canvas.on("object:moving", function (o) {
        inst.disable();
      });
    };

    Arrow.prototype.unBindEventes = function () {
      var inst = this;
      inst.canvas.off("mouse:down");
      inst.canvas.off("mouse:up");
      inst.canvas.off("mouse:move");
      inst.canvas.off("object:moving");
    };

    Arrow.prototype.onMouseUp = function (o) {
      var inst = this;
      inst.disable();
      inst.unBindEventes();
      if (inst.callback) inst.callback();
    };

    Arrow.prototype.onMouseMove = function (o) {
      var inst = this;
      if (!inst.isEnable()) {
        return;
      }

      var pointer = inst.canvas.getPointer(o.e);
      var activeObj = inst?.canvas?.getActiveObject();
      activeObj.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      activeObj.setCoords();
      inst.canvas.renderAll();
    };

    Arrow.prototype.onMouseDown = function (o) {
      var inst = this;
      inst.enable();
      var pointer = inst.canvas.getPointer(o.e);

      var points = [pointer.x, pointer.y, pointer.x, pointer.y];
      var line = new fabric.LineArrow(points, {
        strokeWidth: 5,
        fill: inst.color ? inst.color : "red",
        stroke: inst.color ? inst.color : "red",
        originX: "center",
        originY: "center",
        hasBorders: false,
        hasControls: true,
        selectable: true,
      });

      inst.canvas?.add(line).setActiveObject(line);
    };

    Arrow.prototype.isEnable = function () {
      return this.isDrawing;
    };

    Arrow.prototype.enable = function () {
      this.isDrawing = true;
    };

    Arrow.prototype.disable = function () {
      this.isDrawing = false;
    };

    return Arrow;
  })();

  let PDFAnnotate = function (container_id, Url, options = {}) {
    console.count("count PDF annote function");
    this.number_of_pages = 0;
    this.pages_rendered = 0;
    this.active_tool = 1; // 1 - Free hand, 2 - Text, 3 - Arrow, 4 - Rectangle
    this.fabricObjects = [];
    this.fabricObjectsData = [];
    this.color = "#212121";
    this.borderColor = "#000000";
    this.borderSize = 1;
    this.font_size = 16;
    this.active_canvas = 0;
    this.container_id = container_id;
    this.pageImageCompression = options.pageImageCompression
      ? options.pageImageCompression.toUpperCase()
      : "NONE";
    var inst = this;

    // var loadingTask = window.pdfjsLib.getDocument(sample);
    var loadingTask = window.pdfjsLib.getDocument({ data: Url });

    loadingTask.promise.then(
      function (pdf) {
        // console.log(pdf, "pdf");
        var scale = options.scale ? options.scale : 1.3;
        inst.number_of_pages = pdf.numPages;

        for (var i = 1; i <= pdf.numPages; i++) {
          // eslint-disable-next-line no-loop-func
          document.getElementById(inst.container_id).innerHTML = "";
          pdf.getPage(i).then(function (page) {
            var viewport = page.getViewport({ scale: scale });
            var canvas = document.createElement("canvas");
            document.getElementById(inst.container_id).appendChild(canvas);
            canvas.className = "pdf-canvas";
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var context = canvas.getContext("2d");

            var renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            var renderTask = page.render(renderContext);

            renderTask.promise.then(function () {
              Array.from(document.getElementsByClassName("pdf-canvas")).forEach(
                function (el, ind) {
                  el.setAttribute("id", "page-" + (ind + 1) + "-canvas");
                }
              );
              inst.pages_rendered++;
              if (inst.pages_rendered == inst.number_of_pages) {
                inst.initFabric();
              }
            });
          });
        }
      },
      function (reason) {
        console.error(reason);
      }
    );

    this.initFabric = function () {
      console.count("Fabric initialize count");
      var inst = this;
      let canvases = "#" + inst.container_id + " canvas";
      Array.from(document.querySelectorAll(canvases)).forEach(function (
        el,
        index
      ) {
        var background = el.toDataURL("image/png");

        var fabricObj = new window.fabric.Canvas(el.id, {
          freeDrawingBrush: {
            width: 1,
            color: inst.color,
          },
        });
        inst.fabricObjects.push(fabricObj);

        if (typeof options.onPageUpdated == "function") {
          fabricObj.on("object:added", function () {
            var oldValue = Object.assign({}, inst.fabricObjectsData[index]);
            inst.fabricObjectsData[index] = fabricObj.toJSON();
            options.onPageUpdated(
              index + 1,
              oldValue,
              inst.fabricObjectsData[index]
            );
          });
        }
        // console.log(fabricObj, "  fabricObj.renderAll");
        fabricObj.setBackgroundImage(
          background,
          fabricObj.renderAll.bind(fabricObj)
        );

        // document
        //   .querySelectorAll(fabricObj.upperCanvasEl)
        //   .click(function (event) {
        //     inst.active_canvas = index;
        //     inst.fabricClickHandler(event, fabricObj);
        //     console.log("Va");
        //   });
        fabricObj.upperCanvasEl.onclick = function (event) {
          inst.active_canvas = index;
          inst.fabricClickHandler(event, fabricObj);
        };
        fabricObj.on("after:render", function () {
          inst.fabricObjectsData[index] = fabricObj.toJSON();
          fabricObj.off("after:render");
        });

        if (
          index === canvases.length - 1 &&
          typeof options.ready === "function"
        ) {
          options.ready();
        }
      });
    };
    // console.log(inst, "inst");
    inst.fabricClickHandler = function (event, fabricObj) {
      // var inst = inst;cl
      // console.log(inst.active_tool, "fabric in click handler");
      // console.log("Hey");
      if (inst.active_tool === 2) {
        var text = new window.fabric.IText("Sample text", {
          left:
            event.clientX -
            fabricObj.upperCanvasEl.getBoundingClientRect().left,
          top:
            event.clientY - fabricObj.upperCanvasEl.getBoundingClientRect().top,
          fill: inst.color,
          fontSize: inst.font_size,
          selectable: true,
        });

        fabricObj.add(text);
        inst.active_tool = 0;
      }
    };
  };
  PDFAnnotate.prototype.enableSelector = function () {
    var inst = this;
    inst.active_tool = 0;
    if (inst.fabricObjects.length > 0) {
      // $.each(inst.fabricObjects, function (index, fabricObj) {
      //   fabricObj.isDrawingMode = false;
      // });
      inst.fabricObjects.forEach((fabricObj, index) => {
        fabricObj.isDrawingMode = false;
      });
    }
  };
  PDFAnnotate.prototype.AddTheButton = async function () {
    const emblemUrl = "https://pdf-lib.js.org/assets/mario_emblem.png";
    const emblemImageBytes = await fetch(emblemUrl).then((res) =>
      res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.load(pdfUrl);
    const emblemImage = await pdfDoc.embedPng(emblemImageBytes);
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    // const button = form.createButton("cool.new.button");

    // button.addToPage("content", pages[0], {
    //   x: Math.floor(Math.random() * 80 + 100),
    //   y: Math.floor(Math.random() * 300 + 500),
    // });
    // button.setImage(emblemImage);
    const fields = form.getFields();
    fields.forEach((field) => {
      const name = field.getName();
      const button = form.getButton(name);
      button.setImage(emblemImage);
    });
    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    const emblempdfBytes = await fetch(pdfDataUri).then((res) =>
      res.arrayBuffer()
    );
    pdf = null;
    pdf = new PDFAnnotate("pdf-container", emblempdfBytes, {
      onPageUpdated(page, oldData, newData) {
        // console.log(page, oldData, newData);
      },
      ready() {
        // console.log("Plugin initialized successfully");
      },
      scale: 1.1,
      pageImageCompression: "SLOW", // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
    });
    var inst = this;
    console.log(inst.fabricObjects, "fabricObjects");
    // inst.active_tool = 0;
    // if (inst.fabricObjects.length > 0) {
    //   // $.each(inst.fabricObjects, function (index, fabricObj) {
    //   //   fabricObj.isDrawingMode = false;
    //   // });
    //   inst.fabricObjects.forEach((fabricObj, index) => {
    //     fabricObj.isDrawingMode = false;
    //   });
    // }
  };

  PDFAnnotate.prototype.enablePencil = function () {
    var inst = this;
    inst.active_tool = 1;
    if (inst.fabricObjects.length > 0) {
      // $.each(inst.fabricObjects, function (index, fabricObj) {
      //   fabricObj.isDrawingMode = true;
      // });
      inst.fabricObjects.forEach((fabricObj, index) => {
        return (fabricObj.isDrawingMode = true);
      });
    }
  };

  PDFAnnotate.prototype.enableAddText = function () {
    var inst = this;
    inst.active_tool = 2;
    if (inst.fabricObjects.length > 0) {
      // $.each(inst.fabricObjects, function (index, fabricObj) {
      //   fabricObj.isDrawingMode = false;
      // });
      inst.fabricObjects.forEach((fabricObj, index) => {
        // console.log(fabricObj, "fabricObj in text ");

        return (fabricObj.isDrawingMode = false);
      });
    }
  };
  PDFAnnotate.prototype.enableRectangle = function () {
    var inst = this;
    var fabricObj = inst.fabricObjects[inst.active_canvas];
    inst.active_tool = 4;
    if (inst.fabricObjects.length > 0) {
      // $.each(inst.fabricObjects, function (index, fabricObj) {
      //   fabricObj.isDrawingMode = false;
      // });
      inst.fabricObjects.forEach((fabricObj, index) => {
        fabricObj.isDrawingMode = false;
      });
    }

    rect = new fabric.Rect({
      width: 100,
      height: 100,
      fill: inst.color,
      stroke: inst.borderColor,
      strokeSize: inst.borderSize,
    });
    fabricObj?.add(rect);
  };

  PDFAnnotate.prototype.confirmSign = async function (fileName) {
    var inst = this;
    if (Object.keys(signfabricObj) && Object.keys(signfabricObj).length > 0) {
      Object.keys(signfabricObj).forEach((e) => {
        signfabricObj[e].remove(esigngroup[e]);
      });
    }
    // signfabricObj.remove(sign);
    var doc = new window.jspdf.jsPDF();
    if (typeof fileName === "undefined") {
      fileName = `${new Date().getTime()}.pdf`;
    }

    inst.fabricObjects.forEach(async function (fabricObj, index) {
      if (index !== 0) {
        doc.addPage();
        doc.setPage(index + 1);
      }
      doc.addImage(
        fabricObj.toDataURL({
          format: "png",
        }),
        inst.pageImageCompression === "NONE" ? "PNG" : "JPEG",
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight(),
        `page-${index + 1}`,
        ["FAST", "MEDIUM", "SLOW"].indexOf(inst.pageImageCompression) >= 0
          ? inst.pageImageCompression
          : undefined
      );
      if (index === inst.fabricObjects.length - 1) {
        pdf2 = new Buffer.from(doc.output("arraybuffer"));
        const emblemUrl = "/signfield.png";
        const emblemImageBytes = await fetch(emblemUrl).then((res) =>
          res.arrayBuffer()
        );

        const pdfDoc = await PDFDocument.load(pdf2);
        const emblemImage = await pdfDoc.embedPng(emblemImageBytes);
        const pages = pdfDoc.getPages();

        // Get the form so we can add fields to it
        console.log(pages[0].getWidth(), "width");
        console.log(pages[0].getHeight(), "height");
        const form = pdfDoc.getForm();
        if (
          Object.keys(signfabricObj) &&
          Object.keys(signfabricObj).length > 0
        ) {
          Object.keys(signfabricObj).forEach((each) => {
            const button = form.createButton(`sign.${each}`);
            button.addToPage("content", pages[0], {
              x:
                left[each] > 0
                  ? left[each] >= pages[0].getWidth()
                    ? pages[0].getWidth() - 110
                    : left[each]
                  : 0,
              y:
                top[each] > 0
                  ? top[each] >= pages[0].getHeight()
                    ? 0
                    : pages[0].getHeight() - top[each]
                  : pages[0].getHeight() - 44,
            });

            console.log(left[each], "left[each]");
            console.log(top[each], "top[each]");
            console.log(
              top[each] > 0
                ? pages[0].getHeight() -
                    (top[each] > 615 ? top[each] - 40 : top[each] - 40)
                : pages[0].getHeight() - 40,
              "y"
            );
            console.log(left[each] > 0 ? left[each] : 0, "x");

            console.log(
              pages[0].getWidth() - 3 * left[each],
              "pages[0].getWidth() - 3 * left[each]"
            );
            console.log(
              pages[0].getHeight() - top[each],
              "pages[0].getHeight() - top[each]"
            );

            button.setImage(emblemImage);
          });
        }
        const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
        // const pdfBytes = await pdfDoc.save();
        const emblempdfBytes = await fetch(pdfDataUri).then((res) =>
          res.arrayBuffer()
        );

        pdf = null;
        pdf = new PDFAnnotate("pdf-container", emblempdfBytes, {
          onPageUpdated(page, oldData, newData) {
            // console.log(page, oldData, newData);
          },
          ready() {
            // console.log("Plugin initialized successfully");
          },
          scale: 1.1,
          pageImageCompression: "SLOW", // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
        });
      }
    });

    // statePdfUrl(emblempdfBytes);
  };
  PDFAnnotate.prototype.addsign = function (selectedMail) {
    var inst = this;

    signfabricObj[selectedMail] = {};
    left[selectedMail] = 0;
    top[selectedMail] = 0;
    eleHeight[selectedMail] = 0;
    eleWidth[selectedMail] = 0;
    esigngroup[selectedMail] = {};
    let signfabricObjs = inst.fabricObjects[inst.active_canvas];
    inst.active_tool = 4;
    if (inst.fabricObjects.length > 0) {
      inst.fabricObjects.forEach((fabricObj, index) => {
        fabricObj.isDrawingMode = false;
      });
    }

    var text = new fabric.Text(`signature.${selectedMail}`, {
      fontFamily: "Comic Sans",
      fontSize: 25,
    });
    let sign = new fabric.Rect({
      width: text.width,
      height: text.height,
      fill: inst.color,
      stroke: inst.borderColor,
      strokeSize: inst.borderSize,
    });
    var group = new fabric.Group([text, sign], {
      // left: 100,
      // top: 25,
    });
    esigngroup[selectedMail] = group;
    signfabricObjs?.add(group);
    console.log(group, "group");

    let moveHandler = function (evt) {
      var movingObject = evt.target;
      console.log(movingObject, "movingObject");
      left[a] = movingObject.get("left");
      top[a] = movingObject.get("top");
      eleHeight[a] = movingObject.height;
      eleWidth[a] = movingObject.width;
      console.log(movingObject.get("left"), movingObject.get("top"));
    };
    signfabricObjs.on("object:moving", (e) => {
      moveHandler(e);
    });
    signfabricObjs.on("mouse:down", (e) => {
      a = selectedMail;
    });
    signfabricObj[selectedMail] = signfabricObjs;
  };

  PDFAnnotate.prototype.enableAddArrow = function () {
    var inst = this;
    // console.log(inst.active_tool, "inst active tool in ");
    inst.active_tool = 3;
    if (inst.fabricObjects.length > 0) {
      // $.each(inst.fabricObjects, function (index, fabricObj) {
      // fabricObj.isDrawingMode = false;
      // new Arrow(fabricObj, inst.color, function () {
      //   inst.active_tool = 0;
      // });
      // });

      inst.fabricObjects.forEach((fabricObj) => {
        fabricObj.isDrawingMode = false;
        // console.log(Arrow, "Arrow");
        new Arrow(fabricObj, inst.color, function () {
          // console.log("In out");
          inst.active_tool = 0;
        });
      });
    }
  };

  PDFAnnotate.prototype.addImageToCanvas = function (img) {
    var inst = this;
    var fabricObj = inst.fabricObjects[inst.active_canvas];
    if (img) {
      var image = new Image();
      image.onload = function () {
        fabricObj?.add(new fabric.Image(image));
      };
      image.src = img;
    } else {
      if (fabricObj) {
        var inputElement = document.createElement("input");
        inputElement.type = "file";
        inputElement.accept = ".jpg,.jpeg,.png,.PNG,.JPG,.JPEG";
        inputElement.onchange = function () {
          var reader = new FileReader();
          reader.addEventListener(
            "load",
            function () {
              // inputElement.remove();
              var image = new Image();
              image.onload = function () {
                fabricObj?.add(new fabric.Image(image));
              };
              image.src = imageURL;
            },
            false
          );
          reader.readAsDataURL(inputElement.files[0]);
          // console.log(
          //   reader.readAsDataURL(inputElement.files[0]),
          //   "inputElement.files"
          // );
        };
        document.getElementsByTagName("body")[0].appendChild(inputElement);
        inputElement.click();
      }
    }
  };
  PDFAnnotate.prototype.addSignToCanvas = function () {
    var inst = this;
    var fabricObj = inst.fabricObjects[inst.active_canvas];
    // if (fabricObj) {
    //   var inputElement = document.getElementById("closeBtn");
    //   // inputElement.type = "file";
    //   // inputElement.accept = ".jpg,.jpeg,.png,.PNG,.JPG,.JPEG";
    //   inputElement.onchange = function () {
    //     var reader = new FileReader();
    //     reader.addEventListener(
    //       "load",
    //       function () {
    //         // inputElement.remove();
    //         var image = imageURL;
    //         image.onload = function () {
    //           fabricObj?.add(new fabric.Image(image));
    //         };
    //         image.src = imageURL;
    //       },
    //       false
    //     );

    if (fabricObj) {
      // var inputElement = document.getElementById("closeBtn");
      var inputElement = document.createElement("input");
      inputElement.type = "file";
      inputElement.accept = ".jpg,.jpeg,.png,.PNG,.JPG,.JPEG";
      // inputElement.onchange =
      // if (imageURL?.length > 0) {
      // console.log("e-Sign Render");
      (function () {
        var reader = new FileReader();
        reader.addEventListener(
          "load",
          function () {
            // inputElement.remove();
            // var image = imageURL;
            var image = new Image();
            image.onload = function () {
              fabricObj?.add(new fabric.Image(image));
            };
            image.src = imageURL;
          },
          false
        );
        reader.readAsDataURL(imageURL);
        // console.log(
        //   reader.readAsDataURL(inputElement.files[0]),
        //   "inputElement.files"
        // );
      })();
      // }

      document.getElementsByTagName("body")[0].appendChild(inputElement);
      inputElement.click();
      // inputElement.click();
    }
  };
  const save = () => {
    let img = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    // setImageURL(img);
    img.length > 0 && pdf.addImageToCanvas(img);
  };
  if (imageURL?.length > 0) {
    pdf.addImageToCanvas(imageURL);
    setImageURL(null);
  }

  PDFAnnotate.prototype.deleteSelectedObject = function () {
    var inst = this;
    var activeObject =
      inst.fabricObjects[inst.active_canvas]?.getActiveObject();
    // console.log(activeObject, "activeObject");
    // console.log(
    //   inst.fabricObjects[inst.active_canvas].remove(activeObject),
    //   "inst.fabricObjects"
    // );
    if (activeObject) {
      if (alert("Are you sure ?")) {
        return inst.fabricObjects[inst.active_canvas].remove(activeObject);
      }
    }
  };

  PDFAnnotate.prototype.savePdf = function (fileName) {
    var inst = this;
    var doc = new window.jspdf.jsPDF();
    if (typeof fileName === "undefined") {
      fileName = `${new Date().getTime()}.pdf`;
    }
    inst.fabricObjects.forEach(async function (fabricObj, index) {
      if (index !== 0) {
        doc.addPage();
        doc.setPage(index + 1);
      }
      console.log(fabricObj, "fabricObj");
      doc.addImage(
        fabricObj.toDataURL({
          format: "png",
        }),
        inst.pageImageCompression === "NONE" ? "PNG" : "JPEG",
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight(),
        `page-${index + 1}`,
        ["FAST", "MEDIUM", "SLOW"].indexOf(inst.pageImageCompression) >= 0
          ? inst.pageImageCompression
          : undefined
      );
      if (index === inst.fabricObjects.length - 1) {
        // doc.save(fileName);
        let pdfBuffer = new Buffer.from(doc.output("arraybuffer"));
        const emblemUrl = "/signfield.png";
        const emblemImageBytes = await fetch(emblemUrl).then((res) =>
          res.arrayBuffer()
        );
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const emblemImage = await pdfDoc.embedPng(emblemImageBytes);
        const pages = pdfDoc.getPages();
        const form = pdfDoc.getForm();
        if (
          Object.keys(signfabricObj) &&
          Object.keys(signfabricObj).length > 0
        ) {
          Object.keys(signfabricObj).forEach((each) => {
            const button = form.createButton(`sign.${each}`);
            button.addToPage("content", pages[0], {
              x: left[each] > 0 ? left[each] : 0,
              y:
                top[each] > 0
                  ? pages[0].getHeight() - top[each]
                  : pages[0].getHeight() - 44,
            });

            button.setImage(emblemImage);
          });
        }
        // const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
        const pdfBytes = await pdfDoc.save();
        // const emblempdfBytes = await fetch(pdfDataUri).then((res) =>
        //   res.arrayBuffer()
        // );
        download(
          pdfBytes,
          "pdf-lib_form_creation_example.pdf",
          "application/pdf"
        );
      }
    });
  };
  PDFAnnotate.prototype.setBrushSize = function (size) {
    var inst = this;
    // $.each(inst.fabricObjects, function (index, fabricObj) {
    //   fabricObj.freeDrawingBrush.width = size;
    // });
    inst.fabricObjects.forEach((fabricObj) => {
      // console.log(fabricObj.freeDrawingBrush, "fabricObj.freeDrawingBrush");
      fabricObj.freeDrawingBrush.width = size;
    });
  };

  PDFAnnotate.prototype.setColor = function (color) {
    var inst = this;
    inst.color = color;
    // $.each(inst.fabricObjects, function (index, fabricObj) {
    //   fabricObj.freeDrawingBrush.color = color;
    // });
    inst.fabricObjects.forEach((fabricObj) => {
      fabricObj.freeDrawingBrush.color = color;
    });
  };

  PDFAnnotate.prototype.setBorderColor = function (color) {
    var inst = this;
    inst.borderColor = color;
  };

  PDFAnnotate.prototype.setFontSize = function (size) {
    this.font_size = size;
  };

  PDFAnnotate.prototype.setBorderSize = function (size) {
    this.borderSize = size;
  };

  PDFAnnotate.prototype.clearActivePage = function () {
    var inst = this;
    var fabricObj = inst.fabricObjects[inst.active_canvas];
    // console.log(fabricObj.clear(), "fabricObj");
    var bg = fabricObj.backgroundImage;
    // console.log(bg, "bg");
    if (window.confirm("Are you sure?")) {
      // console.log("In out clear");
      fabricObj.clear();
      fabricObj.setBackgroundImage(bg, fabricObj.renderAll.bind(fabricObj));
    }
  };

  PDFAnnotate.prototype.serializePdf = function () {
    var inst = this;
    return JSON.stringify(inst.fabricObjects, null, 4);
  };

  PDFAnnotate.prototype.loadFromJSON = function (jsonData) {
    var inst = this;
    // $.each(inst.fabricObjects, function (index, fabricObj) {
    // if (jsonData.length > index) {
    //   fabricObj.loadFromJSON(jsonData[index], function () {
    //     inst.fabricObjectsData[index] = fabricObj.toJSON();
    //   });
    // }
    // });
    inst.fabricObjects.forEach((fabricObj, index) => {
      if (jsonData.length > index) {
        fabricObj.loadFromJSON(jsonData[index], function () {
          inst.fabricObjectsData[index] = fabricObj.toJSON();
        });
      }
    });
  };

  // pdf = !pdf
  if (!pdf) {
    pdf = new PDFAnnotate("pdf-container", pdfUrl, {
      onPageUpdated(page, oldData, newData) {
        // console.log(page, oldData, newData);
      },
      ready() {
        // console.log("Plugin initialized successfully");
      },
      scale: 1.1,
      pageImageCompression: "SLOW", // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
    });
  }
  // console.log(pdf, "pdfco");

  function changeActiveTool(event) {
    // console.log(event.currentTarget.parentNode, "event");

    var element = event?.target?.classList.contains("tool-button")
      ? event.target
      : event.currentTarget.parentNode;
    // ".tool-button.active".removeClass("active");
    // element.addClass("active");
    // setPencilTool("active");
  }
  // console.log(changeActiveTool(), "changeActiveTool");
  function enableSelector(event) {
    // event.preventDefault();
    changeActiveTool(event);
    pdf.enableSelector();
  }
  function addbutton() {
    pdf.AddTheButton();
  }
  function addSign() {
    pdf.setColor("rgba(255, 0, 0, 0.3)");
    pdf.setBorderColor("blue");
    pdf.addsign(selectedMail);
  }
  function confirmSign() {
    pdf.confirmSign();
  }
  function enablePencil(event) {
    event?.preventDefault();
    changeActiveTool(event);
    // console.log(pdf.enablePencil(), "pdf pencil");
    pdf.enablePencil();
  }

  function enableAddText(event) {
    event?.preventDefault();
    changeActiveTool(event);
    pdf.enableAddText();
    // console.log(pdf, "pdf");
  }

  function enableAddArrow(event) {
    event?.preventDefault();
    changeActiveTool(event);
    pdf.enableAddArrow();
  }

  function addImage(event) {
    event?.preventDefault();
    pdf.addImageToCanvas();
  }

  function enableRectangle(event) {
    event?.preventDefault();
    changeActiveTool(event);
    pdf.setColor("rgba(255, 0, 0, 0.3)");
    pdf.setBorderColor("blue");
    pdf.enableRectangle();
  }

  function deleteSelectedObject(event) {
    event?.preventDefault();
    pdf.deleteSelectedObject();
  }

  async function savePDF() {
    // pdf.savePdf();
    let b64 = new Buffer.from(pdfUrl).toString("base64");
    // console.log(b64, "b64");
    pdf.savePdf(b64); // save with given file name
  }

  function clearPage() {
    pdf.clearActivePage();
    pdf = new PDFAnnotate("pdf-container", pdfUrl, {
      onPageUpdated(page, oldData, newData) {
        // console.log(page, oldData, newData);
      },
      ready() {
        // console.log("Plugin initialized successfully");
      },
      scale: 1.1,
      pageImageCompression: "SLOW", // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
    });
    setImageURL(null);
  }

  // function showPdfData() {
  //   var string = pdf.serializePdf();
  //   $("#dataModal .modal-body pre").first().text(string);
  //   PR.prettyPrint();
  //   $("#dataModal").modal("show");
  // }
  // document.querySelector("brush-size")?.addEventListener("change", function () {
  //   var width = this.val();
  //   pdf.setBrushSize(width);
  // });

  document.addEventListener("DOMContentLoaded", () => {
    // document.getElementByClassName("color-tool").click(function () {
    //   $(".color-tool.active").classList.remove("active");
    //   this.classList.add("active");
    //   color = this.get(0).style.backgroundColor;
    //   pdf.setColor(color);
    // });

    // document.getElementById("brush-size").change(function () {
    //   let width = this.value;
    //   console.log(width,":width")
    //   pdf.setBrushSize(width);
    // });

    document.getElementById("brush-size").addEventListener("change", (e) => {
      pdf.setBrushSize(e.target.value);
    });

    document.getElementById("font-size").change(function () {
      let font_size = this.value;
      pdf.setFontSize(font_size);
    });
  });

  return (
    <>
      {console.count("render count")}
      <div className="body">
        <div className="toolbar">
          <div className="tool">
            <span>Sender End</span>
          </div>
          <div className="tool">
            <label htmlFor="brush-size">Brush size</label>
            <input
              type="number"
              className="form-control text-right"
              // value="1"
              defaultValue={"1"}
              id="brush-size"
              max="50"
              // onChange={(e) => {
              //   setFile(e);
              // }}
            />
          </div>
          <div className="tool">
            <label htmlFor="font-size">Font size</label>
            <select id="font-size" className="form-control">
              <option value="10">10</option>
              <option value="12">12</option>
              <option value="16" defaultValue={16}>
                16
              </option>
              <option value="18">18</option>
              <option value="24">24</option>
              <option value="32">32</option>
              <option value="48">48</option>
              <option value="64">64</option>
              <option value="72">72</option>
              <option value="108">108</option>
            </select>
          </div>
          <div className="tool">
            <button
              className="color-tool active"
              style={{ backgroundColor: "#212121" }}
            ></button>
            <button
              className="color-tool"
              style={{ backgroundColor: "red" }}
            ></button>
            <button
              className="color-tool"
              style={{ backgroundColor: "blue" }}
            ></button>
            <button
              className="color-tool"
              style={{ backgroundColor: "green" }}
            ></button>
            <button
              className="color-tool"
              style={{ backgroundColor: "yellow" }}
            ></button>
          </div>
          <div className="tool">
            <button className="tool-button active">
              <i
                className="fa fa-hand-paper-o"
                title="Free Hand"
                onClick={(e) => {
                  enableSelector(e);
                }}
              ></i>
            </button>
          </div>
          <div className="tool">
            <button className="tool-button active">
              <i
                className="fa fa-hand-paper-o"
                title="Free Button"
                onClick={(e) => {
                  addbutton(e);
                }}
              ></i>
            </button>
          </div>
          <div className="tool">
            <button className={`tool-button active`}>
              <i
                className="fa fa-pencil"
                title="Pencil"
                onClick={(e) => {
                  enablePencil(e);
                }}
              ></i>
            </button>
          </div>
          <div className="tool">
            <button className="tool-button">
              <i
                className="fa fa-font"
                title="Add Text"
                onClick={(e) => {
                  enableAddText(e);
                }}
              ></i>
            </button>
          </div>
          <div className="tool">
            <button className="tool-button ">
              <i
                className="fa fa-long-arrow-right"
                title="Add Arrow"
                onClick={(e) => {
                  enableAddArrow(e);
                }}
              ></i>
            </button>
          </div>
          <div className="tool">
            <button className="tool-button">
              <i
                className="fa fa-square-o"
                title="Add rectangle"
                onClick={(e) => {
                  enableRectangle(e);
                }}
              ></i>
            </button>
          </div>
          <div className="tool">
            <button className="tool-button">
              <i
                className="fa fa-picture-o"
                title="Add an Image"
                onClick={(e) => {
                  addImage(e);
                }}
              ></i>
            </button>
          </div>
          <div className="tool">
            <button className="tool-button">
              <i
                className="fa fa-eyedropper"
                title="Add Signature"
                onClick={(e) => {
                  // addImage(e);
                  handleClickOpen();
                }}
              ></i>
            </button>
          </div>
          {/* <div className="tool">
            <button
              className="btn btn-info btn-sm"
              onClick={(e) => {
                addSign(e);
              }}
            >
              Add sign
            </button>
          </div>
          <div className="tool">
            <button
              className="btn btn-info btn-sm"
              onClick={(e) => {
                confirmSign(e);
              }}
            >
              Confirm sign
            </button>
          </div> */}
          <div className="tool">
            <button
              className="btn btn-danger btn-sm"
              onClick={(e) => {
                deleteSelectedObject(e);
              }}
            >
              <i className="fa fa-trash"></i>
            </button>
          </div>
          <div className="tool">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                clearPage();
              }}
            >
              Clear Page
            </button>
          </div>
          {/* <div className="tool">
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                setOpenEsign(true);
              }}
            >
              e-Signature
            </button>
          </div> */}
          <div className="tool">
            <button className="btn btn-info btn-sm">{}</button>
          </div>
          <div className="tool">
            <button
              className="btn btn-light btn-sm"
              onClick={() => {
                savePDF();
              }}
            >
              <i className="fa fa-save"></i> Save
            </button>
          </div>
        </div>
        <div className="sideNav">
          <div className="tool">
            {selectedMail === "user1@info.com" ? (
              <button className="btn btn-info">user1@info.com</button>
            ) : (
              <button
                onClick={(e) => {
                  setSelectedMail("user1@info.com");
                }}
                className="btn btn-light"
              >
                user1@info.com
              </button>
            )}
          </div>
          <div className="tool">
            {selectedMail === "user2@info.com" ? (
              <button className="btn btn-info">user2@info.com</button>
            ) : (
              <button
                onClick={(e) => {
                  setSelectedMail("user2@info.com");
                }}
                className="btn btn-light"
              >
                user2@info.com
              </button>
            )}
          </div>
          <div className="tool">
            <button
              className="btn btn-primary"
              onClick={(e) => {
                addSign(e);
                setSignsAdd(true);
              }}
              disabled={selectedMail ? "" : "disabled"}
            >
              Add sign
            </button>
          </div>
          <div className="tool">
            <button
              className="btn btn-info btn-sm"
              onClick={(e) => {
                confirmSign(e);
              }}
              disabled={signsAdd ? "" : "disabled"}
            >
              Confirm sign
            </button>
          </div>
        </div>
        {/* <h1>Signature Pad Example</h1> */}
        {/* <Popup
          modal
          trigger={<button>Open Signature Pad</button>}
          closeOnDocumentClick={openSignPad}
        >
          {(close) => (
            <>
              <SignaturePad
                ref={sigCanvas}
                canvasProps={{
                  className: "signatureCanvas",
                }}
              />
              <button onClick={save}>Save</button>
              <button onClick={clear}>Clear</button>
              <button id="closeBtn" onClick={closeModal()}>
                Close
              </button>
            </>
          )}
        </Popup> */}

        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
        >
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            Signature
          </DialogTitle>
          <DialogContent>
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
                <Button onClick={clear} color="primary">
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    save();
                    handleClose();
                  }}
                  color="primary"
                >
                  Save
                </Button>
              </div>
              {/* <Button id="closeBtn" onClick={closeModal()}></Button> */}
            </>
          </DialogContent>
          <DialogActions>
            <Button autoFocus color="primary" onClick={handleClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={openEsign}
        >
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            E-Signature
          </DialogTitle>
          <DialogContent>
            <>
              <BasicTabs
                setImageURL={setImageURL}
                setOpenEsign={setOpenEsign}
              />
            </>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                handleClose();
              }}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <br />
        <br />
        {/* if our we have a non-null image url we should 
      show an image and pass our imageURL state to it*/}
        {/* {imageURL ? (
          <img
            src={imageURL}
            alt="my signature"
            style={{
              display: "block",
              margin: "0 auto",
              border: "1px solid black",
              width: "150px",
            }}
          />
        ) : null} */}
        <div id="pdf-container"></div>
        <div
          className="modal fade"
          id="dataModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="dataModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="dataModalLabel">
                  PDF annotation data
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body">
                <pre className="prettyprint lang-json linenums"></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Annotation;
