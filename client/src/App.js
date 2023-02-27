import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element ={<>hiiii</>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
