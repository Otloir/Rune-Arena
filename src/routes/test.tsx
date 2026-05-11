import { useType, useMoves } from "../hooks/useCreature";
import Input from "../components/atoms/Form/Input";
import Item from "../components/atoms/Item/Item";
import StatusPanel from "../components/molecules/StatusPanel/StatusPanel";
import Creature from "../components/molecules/Creature/Creature";

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

      <section>
        <Creature userId="2" role="opponent" />
        <Creature userId="1" role="player" />
      </section>

      <section>
        <StatusPanel userId="1" currentHp={100} />
        <StatusPanel userId="2" currentHp={50} />
      </section>

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
