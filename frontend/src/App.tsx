import React, { useState, useRef, useEffect} from 'react';
import * as ReactDOM from "react-dom/client";
import './App.css';
import placeholderSquare from "./placeholder-square.png";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import TrackPage from './routes/track';
import Home from './routes/home';
import Login from './routes/login';
import Signup from './routes/signup';

export function initGLCanvas(canvas: HTMLCanvasElement) {
  // Initialize the GL context
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function WebGLBackground() {
  let height = 100;
  let width = 100;
  const canvasRef = useRef(null)
  useEffect(() => {
    if (canvasRef != null && canvasRef.current != null) {
      initGLCanvas(canvasRef.current);
    } else {
      console.log("canvas not initialized!")
    }
  });
  return (
      <canvas id="glcanvas" ref={canvasRef} width={width} height={height}/>
  );
}

function Footer() {
  return (
    <div>
      <div>made with 💜 in sunnyvale, ca 🌞</div>
      <div><a href="/login">are you an artist? get <i>your</i> link here</a></div>
      <div><a>buy me a ☕️</a></div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
    errorElement: <div> uh-oh, error!</div>,
  },
  {
    path: "/track",
    element: <TrackPage/>,
    errorElement: <div> uh-oh, error!</div>,
  },
  {
    path: "/login",
    element: <Login/>,
    errorElement: <div> uh-oh, error!</div>,
  },
  {
    path: "/signup",
    element: <Signup/>,
    errorElement: <div> uh-oh, error!</div>,
  },
  {
    path: "/artist",
    element: <div>artist management page</div>,
    errorElement: <div> uh-oh, error!</div>,
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router}/>
      <Footer/>
    </>
  );
}
