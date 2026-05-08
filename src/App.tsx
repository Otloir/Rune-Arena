import Bars from "./components/Atoms/Bars/Bars";
import "./App.css";
import { useCreature, useType, useMoves } from "./hooks/useCreature";
import Input from "./components/Atoms/Form/Input";
import Item from "./components/atoms/Item/Item";

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
        <Bars current={60} max={creature?.hp} variant="hp" />
        <Bars current={500} max={2000} variant="xp" />
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
      
      <ul>
        <Item itemId={1} /> 
      </ul>
    </>
  );
}

export default App;
