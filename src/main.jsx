import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { Admin } from "./Admin.jsx";
import { Shop } from "./Shop.jsx";
import "./styles.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const Screen = path === "/shop" || path.endsWith("/shop.html") ? Shop : path === "/admin" || path.endsWith("/admin.html") ? Admin : App;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Screen />
  </React.StrictMode>,
);
