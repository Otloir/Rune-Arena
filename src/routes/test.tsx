import { useType, useMoves } from "../hooks/useCreature";
import { useItem } from "../hooks/useItem";

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

  // 👇 fetch item directly so we can use item.img in IconButton
  const { item, loading: itemLoading } = useItem(1);

  return (
    <>
      {/* FORM SECTION */}
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input type="number" label="Quantity" />
        </form>
      </section>

      {/* STATUS SECTION */}
      <section>
        <StatusPanel userId="3" currentHp={100} />
        <StatusPanel userId="2" currentHp={0} />
      </section>

      {/* BUTTONS / INTERACTIONS */}
      <section>
        <Button onClick={() => alert("Clicked!")} />

        <IconButton
          label="Use item"
          icon={
            itemLoading ? (
              <span>...</span>
            ) : item ? (
              <img
                src={item.img}
                alt={item.name}
                style={{
                  width: 24,
                  height: 24,
                  objectFit: "contain",
                }}
              />
            ) : (
              <span>No item</span>
            )
          }
          onClick={() => alert("Clicked!")}
        />

        <CreatureButton
          creatureId={1}
          onSelect={(creature) => console.log("Selected creature:", creature)}
        />

        <MoveButton
          moveId={1}
          onSelect={(move) => console.log("Selected move:", move)}
        />

        <NavButton to="menu" />
      </section>

      {/* TYPES LIST */}
      <ul>
        {types.map((type) => (
          <li key={type.name}>{type.name}</li>
        ))}
      </ul>

      {/* MOVES LIST */}
      <ul>
        {moves.map((move) => (
          <li key={move.name}>{move.name}</li>
        ))}
      </ul>

      {/* ITEM DISPLAY (standard UI component) */}
      <ul>
        <Item itemId={1} />
      </ul>
    </>
  );
}