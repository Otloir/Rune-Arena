import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Test from "./routes/test";
import Lobby from "./routes/Lobby";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
