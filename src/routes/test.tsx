import { useType, useMoves } from "../hooks/useCreature";
import { useItem } from "../hooks/useItem";

import Input from "../components/atoms/Form/Input";
import Item from "../components/atoms/Item/Item";
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
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input type="number" label="Quantity" />
        </form>
      </section>

      <section>
       <Button onClick={() => alert("Clicked!")} color="#33ff32" shape="pill"/>
       <Button onClick={() => alert("Clicked!")} disabled color="#00ccff" shape="circle"/>
       <Button onClick={() => alert("Clicked!")} color="#ff0000" variant="destructive" size="lg" radius={0} shadow />


       <IconButton
          label="Use item"
          variant="invisible"
          iconSize="1.5rem"
          icon={
            itemLoading ? (
              <span>...</span>
            ) : item ? (
              <img
                src={item.img}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span>No item</span>
            )
          }
          onClick={() => alert("Clicked!")}
        />
       <IconButton
          label="Use item"
          variant="invisible"
          iconSize="50px"
          disabled
          icon={
            itemLoading ? (
              <span>...</span>
            ) : item ? (
              <img
                src={item.img}
                alt={item.name}
                style={{
                  width: "50%",
                  height: "100%",
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
         creatureId="1"
         onSelect={(creature) => console.log("Selected creature:", creature)}
       />
       <CreatureButton
         creatureId="1"
         onSelect={(creature) => console.log("Selected creature:", creature)}
         disabled
       />


       <MoveButton
         moveId={1}
         damageLabel="Damage: "
         onSelect={(move) => console.log("Selected move:", move)}
       />

       <MoveButton
          moveId={1}
          damageLabel={
            itemLoading ? "..." : item ? (
              <img
                src={item.img}
                alt={item.name}
                style={{ width: "16px", height: "16px", objectFit: "contain" }}
              />
            ) : "⚔️"
          }
          onSelect={(move) => console.log("Selected move:", move)}
          disabled
        />


       <NavButton to="menu" />
       <NavButton to="menu" label="Forbidden Menu..." disabled />
       <NavButton to="menu" shape="circle" variant="neutral"/>
       <NavButton to="menu" label="Incorrect File Menu..." icon={<img src="./../../../src/assets/images/vite.svg" alt="Vite" />} variant="action"/>
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