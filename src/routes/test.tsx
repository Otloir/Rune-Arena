import { useType, useMoves } from "../hooks/useCreature";
import Input from "../components/atoms/Form/Input";
import Item from "../components/atoms/Item/Item";
import BattleArena from "../components/organisms/BattleArena/BattleArena";

export default function Test() {
  const { types } = useType();
  const { moves } = useMoves();

  return (
    <>
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input type="number" label="Quantity" />
        </form>
      </section>

      <BattleArena playerOne="1" playerTwo="2"/>

      <ul>
        {types.map((type) => (
          <li key={type.name}>{type.name}</li>
        ))}
      </ul>

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
