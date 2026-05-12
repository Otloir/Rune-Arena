import { useType, useMoves } from "../hooks/useCreature";
import { useItem } from "../hooks/useItem";

import Input from "../components/atoms/Form/Input";
import Item from "../components/atoms/Item/Item";
import StatusPanel from "../components/molecules/StatusPanel/StatusPanel";
import Creature from "../components/molecules/Creature/Creature";
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
        <Creature userId="2" role="opponent" />
        <Creature userId="1" role="player" />
      </section>

      <section>
        <StatusPanel userId="1" currentHp={100} />
        <StatusPanel userId="2" currentHp={50} />
      </section>

      <section>
       <Button onClick={() => alert("Clicked!")} color="green" shape="pill"/>
       <Button onClick={() => alert("Clicked!")} disabled color="green" shape="circle"/>
       <Button onClick={() => alert("Clicked!")} color="red"variant="destructive" size="lg" radius={0} shadow />


       <IconButton
         label="Use item"
         variant="invisible"
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
       <IconButton
         label="Use item"
         color="#615134"
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
         disabled
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
         onSelect={(move) => console.log("Selected move:", move)}
       />

       <MoveButton
         moveId={1}
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