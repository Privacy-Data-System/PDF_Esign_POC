import React, { useState, useRef, useEffect } from "react";
import Popup from "reactjs-popup";
import SignaturePad from "react-signature-canvas";
import { useSpring, animated } from "@react-spring/web";
import { createUseGesture, dragAction, pinchAction } from "@use-gesture/react";
import styles from "./style.module.css";
import "./pdf.css";
import "./signatureCanvas.css";
// import { pdfjsLib, jspdf, PDFJSLib } from "pdfjs-dist";
// import { fabric } from "fabric";
import sample from "./sample.pdf";
const useGesture = createUseGesture([dragAction, pinchAction]);

function Annotation() {
  // const [file, setFile] = useState();
  // const [pencilTool, setPencilTool] = useState();
  const [imageURL, setImageURL] = useState(null); // create a state that will contain our image url
  const sigCanvas = useRef({});
  // console.log(imageURL?.toString(), "imageYrl");
  useEffect(() => {
    const handler = (e) => e.preventDefault();
    document.addEventListener("gesturestart", handler);
    document.addEventListener("gesturechange", handler);
    document.addEventListener("gestureend", handler);
    return () => {
      document.removeEventListener("gesturestart", handler);
      document.removeEventListener("gesturechange", handler);
      document.removeEventListener("gestureend", handler);
    };
  }, []);
  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: 0,
  }));
  const ref = useRef(null);
  useGesture(
    {
      // onHover: ({ active, event }) => console.log('hover', event, active),
      // onMove: ({ event }) => console.log('move', event),
      onDrag: ({ pinching, cancel, offset: [x, y], ...rest }) => {
        if (pinching) return cancel();
        api.start({ x, y });
      },
      onPinch: ({
        origin: [ox, oy],
        first,
        movement: [ms],
        offset: [s, a],
        memo,
      }) => {
        if (first) {
          const { width, height, x, y } = ref.current.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [style.x.get(), style.y.get(), tx, ty];
        }

        const x = memo[0] - (ms - 1) * memo[2];
        const y = memo[1] - (ms - 1) * memo[3];
        api.start({ scale: s, rotateZ: a, x, y });
        return memo;
      },
    },
    {
      target: ref,
      drag: { from: () => [style.x.get(), style.y.get()] },
      pinch: { scaleBounds: { min: 0.5, max: 2 }, rubberband: true },
    }
  );
  const clear = () => sigCanvas.current.clear();

  //
  let fabric = window.fabric;
  console.log(this, "this");
  console.log(fabric, "fabric");
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

  var PDFAnnotate = function (container_id, url, options = {}) {
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
    this.url = url;
    this.pageImageCompression = options.pageImageCompression
      ? options.pageImageCompression.toUpperCase()
      : "NONE";
    var inst = this;

    // console.log(url, "url");
    var loadingTask = window.pdfjsLib.getDocument(this.url);
    loadingTask.promise.then(
      function (pdf) {
        var scale = options.scale ? options.scale : 1.3;
        inst.number_of_pages = pdf.numPages;

        for (var i = 1; i <= pdf.numPages; i++) {
          // eslint-disable-next-line no-loop-func
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
                function (el, index) {
                  // console.log(el, "el", index);
                  el.setAttribute("id", "page-" + (index + 1) + "-canvas");
                }
              );
              inst.pages_rendered++;
              if (inst.pages_rendered == inst.number_of_pages)
                inst.initFabric();
            });
          });
        }
      },
      function (reason) {
        console.error(reason);
      }
    );

    this.initFabric = function () {
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

    var rect = new fabric.Rect({
      width: 100,
      height: 100,
      fill: inst.color,
      stroke: inst.borderColor,
      strokeSize: inst.borderSize,
    });
    fabricObj?.add(rect);
  };

  PDFAnnotate.prototype.enableAddArrow = function () {
    var inst = this;

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

        new Arrow(fabricObj, inst.color, function () {
          inst.active_tool = 0;
        });
      });
    }
  };

  PDFAnnotate.prototype.addSignToCanvas = function (imageURL) {
    var inst = this;
    var fabricObj = inst.fabricObjects[inst.active_canvas];
    console.log(imageURL, "imageURL va");
    if (fabricObj) {
      var inputElement = document.createElement("input");
      // inputElement.type = "file";
      // inputElement.accept = ".jpg,.jpeg,.png,.PNG,.JPG,.JPEG";
      // inputElement.onchange = function () {
      //   var reader = new FileReader();
      //   reader.addEventListener(
      //     "load",
      //     function () {
      //       inputElement.remove();
      //       var image = new Image();
      //       console.log(image, "image");
      //       image.onload = function () {
      //         fabricObj?.add(new fabric.Image(image));
      //       };
      //       image.src = this.result;
      //     },
      //     false
      //   );
      //   reader.readAsDataURL(inputElement.files[0]);
      // };
      var reader = new FileReader();
      reader.addEventListener(
        "load",
        function () {
          // inputElement.remove();
          var image = imageURL;
          console.log(image, "image");
          image.onload = function () {
            fabricObj?.add(new fabric.Image(image));
          };
          image.src = imageURL;
          // image.src =
          //   "https://www.morebusiness.com/wp-content/uploads/2020/09/handwritten-email-signature.jpg.webp";
        },
        false
      );
      reader.readAsDataURL(imageURL);
      console.log(inputElement, "inputElement");
      document.getElementsByTagName("body")[0].appendChild(inputElement);
      inputElement.click();
    }
  };
  const save = () => {
    setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
    // console.log(imageURL.length, "imageURL.length va");
    imageURL.length > 0 && pdf.addSignToCanvas(imageURL);
  };

  PDFAnnotate.prototype.addImageToCanvas = function () {
    var inst = this;
    var fabricObj = inst.fabricObjects[inst.active_canvas];

    if (fabricObj) {
      var inputElement = document.createElement("input");
      inputElement.type = "file";
      inputElement.accept = ".jpg,.jpeg,.png,.PNG,.JPG,.JPEG";
      inputElement.onchange = function () {
        var reader = new FileReader();
        reader.addEventListener(
          "load",
          function () {
            inputElement.remove();
            var image = new Image();
            // console.log(image, "image");
            image.onload = function () {
              fabricObj?.add(new fabric.Image(image));
            };
            image.src = this.result;
          },
          false
        );
        // console.log(inputElement.files, "inputElement.files");
        reader.readAsDataURL(inputElement.files[0]);
      };
      document.getElementsByTagName("body")[0].appendChild(inputElement);
      inputElement.click();
    }
  };

  PDFAnnotate.prototype.deleteSelectedObject = function () {
    var inst = this;
    var activeObject =
      inst.fabricObjects[inst.active_canvas]?.getActiveObject();

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

    inst.fabricObjects.forEach(function (fabricObj, index) {
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
        doc.save(fileName);
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

  var pdf = new PDFAnnotate("pdf-container", sample, {
    onPageUpdated(page, oldData, newData) {
      console.log(page, oldData, newData);
    },
    ready() {
      console.log("Plugin initialized successfully");
    },
    scale: 1.5,
    pageImageCompression: "MEDIUM", // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
  });

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
  function addSign(event) {
    event?.preventDefault();
    pdf.addSignToCanvas();
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

  function savePDF() {
    // pdf.savePdf();
    pdf.savePdf(sample); // save with given file name
  }

  function clearPage() {
    pdf.clearActivePage();
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
  // console.log(inst);

  // function myFunction() {
  //   var x = document.getElementById("brush-size").value;
  // }
  // document.addEventListener("DOMContentLoaded", () => {
  //   // document.getElementByClassName("color-tool").click(function () {
  //   //   $(".color-tool.active").classList.remove("active");
  //   //   this.classList.add("active");
  //   //   color = this.get(0).style.backgroundColor;
  //   //   pdf.setColor(color);
  //   // });
  //   console.log("hi in eve");
  //   document.getElementById(".brush-size").change(function () {
  //     console.log(window.value, "this in doc");
  //     let width = this.value;
  //     pdf.setBrushSize(width);
  //   });

  // document.querySelector("input").addEventListener("change", function () {
  //   let width = document.querySelector(this.val());
  //   // let width = window.val();
  //   pdf.setBrushSize(width);
  // });
  // document.getElementById("font-size").change(function () {
  //   let font_size = this.value;
  //   pdf.setFontSize(font_size);
  // });
  // });

  return (
    <>
      {/* {/ <div>React PDF</div> /} */}
      <div className="body">
        <div className="toolbar">
          <div className="tool">
            <span>PDFJS + FabricJS + jsPDF</span>
          </div>
          <div className="tool">
            <label>Brush size</label>
            <input
              type="number"
              className="form-control text-right"
              value="1"
              id="brush-size"
              max="50"
              onchange="myFunction()"
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
                className="fa fa-square-o"
                title="Sign"
                onClick={(e) => {
                  addSign(e);
                }}
              ></i>
            </button>
          </div>
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
          <div>
            <Popup
              modal
              trigger={<button>Open Signature Pad</button>}
              closeOnDocumentClick={false}
            >
              {(close) => (
                <>
                  <SignaturePad
                    ref={sigCanvas}
                    canvasProps={{
                      className: "signatureCanvas",
                      backgroundColor: "white",
                    }}
                  />
                  {/* Button to trigger save canvas image */}
                  <button onClick={save}>Save</button>
                  <button onClick={clear}>Clear</button>
                  <button onClick={close}>Close</button>
                </>
              )}
            </Popup>
            <br />
            <br />
            <div>
              <animated.div className={styles.card} ref={ref} style={style}>
                {/* <img
                  src={imageURL}
                  alt="my signature"
                  style={{
                    display: "block",
                    margin: "0 auto",
                    border: "1px solid black",
                    width: "300px",
                    backgroundColor: "white",
                  }}
                /> */}
              </animated.div>
            </div>
            {/* {imageURL ? (
              <img
                src={imageURL}
                alt="my signature"
                style={{
                  display: "block",
                  margin: "0 auto",
                  border: "1px solid black",
                  width: "300px",
                  backgroundColor: "white",
                }}
              />
            ) : null} */}
          </div>

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