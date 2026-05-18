import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Lobby from "./routes/Lobby";
import Arena from "./routes/Arena";
import Store from "./routes/Store";
import Result from "./routes/Result";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/store" element={<Store />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
