import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Test from "./routes/test";
import Lobby from "./routes/Lobby";
import BattleArena from "./components/organisms/BattleArena/BattleArena";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/test" element={<Test />} />
          <Route path="/arena" element={<BattleArena />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
