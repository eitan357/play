import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./pages/home";
import Upload from "./pages/upload";
import Scripts from "./pages/scripts";
import Performance from "./pages/performance";
import Rehearsal from "./pages/rehearsal";
import ScriptDetail from "./pages/scriptDetail";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/scripts" element={<Scripts />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/rehearsal" element={<Rehearsal />} />
          <Route path="/script-detail" element={<ScriptDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
