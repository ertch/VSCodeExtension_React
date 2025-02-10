
import React from "react";
import ReactDOM from "react-dom/client";
import Layout from "./components/Layout";
import Card from './components/Card';
import "./index.css"; 

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Layout>
            <Card/>
        </Layout>
    </React.StrictMode>
);
