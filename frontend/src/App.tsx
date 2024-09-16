import React, { useState } from 'react';
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
