import React from "react";
import {createRoot} from "react-dom/client";
import Prototype from "./LiveCalendar";
import "./prototype.css";
import "./native.css";
createRoot(document.getElementById("root")!).render(<Prototype/>);
