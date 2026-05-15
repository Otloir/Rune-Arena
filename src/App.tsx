import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Test from "./routes/test";
import Lobby from "./routes/Lobby";
import Arena from "./routes/Arena";
import Store from "./routes/Store";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/test" element={<Test />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/store" element={<Store />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
