// @format
import React, { Component } from "react";
import LC from "literallycanvas";
import LiterallyCanvas from "literallycanvas/lib/js/core/LiterallyCanvas";
import defaultOptions from "literallycanvas/lib/js/core/defaultOptions";
import "literallycanvas/lib/css/literallycanvas.css";

class DrawCanvas extends Component {
  constructor(props) {
    super(props);
    defaultOptions.imageURLPrefix = "/lib/img";
    defaultOptions.backgroundColor = "white";
    defaultOptions.toolbarPosition = "top";
    defaultOptions.imageSize = { width: 500, height: 500 };

    this.lc = new LiterallyCanvas(defaultOptions);
    var newImage = new Image();
    newImage.src = props.image;
    this.lc.saveShape(
      LC.createShape("Image", { x: 0, y: 0, image: newImage, scale: 3 })
    );
  }
  render() {
    return <LC.LiterallyCanvasReactComponent lc={this.lc} />;
  }
}
export default DrawCanvas;
