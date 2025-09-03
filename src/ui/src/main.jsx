
import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./components/Layout";
import Canvas from './components/Canvas.jsx';
import { previewComponents } from "./utils/componentPalette";
import "./index.css"; 

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Layout>
            <Canvas palette={previewComponents}/>
        </Layout>
    </React.StrictMode>
);
