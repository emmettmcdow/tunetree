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
  {
    path: "/up",
    element: <div>Frontend Healthy</div>,
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
