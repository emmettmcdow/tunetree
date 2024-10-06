import React, { useState, useRef, useEffect} from 'react';
import * as ReactDOM from "react-dom/client";
import './App.css';
import placeholderSquare from "./placeholder-square.png";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import TrackPage, { loader as trackLoader } from './routes/track';
import Home from './routes/home';
import Login from './routes/login';
import Signup from './routes/signup';
import Artist from './routes/artist';

function Footer() {
  return (
    <div className="flex flex-col text-center bg-indigo-200 py-4">
        <div className="my-2" >made with 💜 in sunnyvale, ca 🌞</div>
        <div className="my-2" ><a href="/login">are you an artist? get <i>your</i> link here</a></div>
        <div className="my-2" ><a>buy me a ☕️</a></div>
        <div className="my-2" >font by <a href="https://fontenddev.com">jeti</a></div>
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
    path: "/track/:artistName",
    element: <TrackPage/>,
    loader: trackLoader,
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
    element: <Artist/>,
    errorElement: <div> uh-oh, error!</div>,
  },
]);

export default function App() {
  return (
    <div className="bg-indigo-100">
      <RouterProvider router={router}/>
      <Footer/>
    </div>
  );
}
