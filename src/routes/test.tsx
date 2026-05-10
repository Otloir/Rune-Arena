import { useType, useMoves } from "../hooks/useCreature";
import Input from "../components/atoms/Form/Input";
import Item from "../components/atoms/Item/Item";
import StatusPanel from "../components/molecules/StatusPanel/StatusPanel";
import Button from "../components/atoms/buttons/Button";
import IconButton from "../components/atoms/buttons/IconButton";
import CreatureButton from "../components/atoms/buttons/CreatureButton";
import MoveButton from "../components/atoms/buttons/MoveButton";
import NavButton from "../components/atoms/buttons/NavButton";


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
        <StatusPanel userId="3" currentHp={100} />
        <StatusPanel userId="2" currentHp={0} />
      </section>
      
      <section>
        <Button label="Click me" onClick={() => alert("Clicked!")} />
        <IconButton label="Click me" icon="heart" onClick={() => alert("Clicked!")} />
        <CreatureButton creatureId={1} />
        <MoveButton moveId={1} onSelect={(move) => console.log(move)} />
        <NavButton to="/shop" />
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
