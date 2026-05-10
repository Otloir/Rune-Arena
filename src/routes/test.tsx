import { useCreature, useType, useMoves } from "../hooks/useCreature";
import Input from "../components/atoms/Form/Input";
import Item from "../components/atoms/Item/Item";
import StatusPanel from "../components/molecules/StatusPanel/StatusPanel";

export default function Test() {
  const { types } = useType();

  const { moves } = useMoves();

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
      {/* hardcoded how much hp the creature has (currentHp), fix later when we have move buttons */}
      <section>
        <StatusPanel user="1" currentHp={0} />
        <StatusPanel user="2" currentHp={90} />
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
