import Bars from "./components/Atoms/Bars/Bars";
import "./App.css";
import { useCreature, useType, useMoves } from "./hooks/useCreature";
import Input from "./components/Atoms/Form/Input";

function App() {
  const { creatures } = useCreature();
  const { types } = useType();

  const { moves } = useMoves();

  // temporary fixed placeholder. make dynamic later
  const creature = creatures[0];

  return (
    <>
      {/* number input */}
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input type="number" label="Quantity" />
        </form>
      </section>

      {/* HP and XP bars */}
      <section>
        <Bars current={80} max={creature?.hp} variant="hp" aria="hp bar" />
        <Bars current={500} max={2000} variant="xp" aria="xp bar" />
      </section>

      {/* Types */}
      <ul>
        {types.map((type) => (
          <li key={type.name}>{type.name}</li>
        ))}
      </ul>

      {/* moves */}
      <ul>
        {moves.map((move) => (
          <li key={move.name}>{move.name}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
