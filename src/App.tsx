import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase"; // use the shared client
import Input from "./components/Atoms/Form/Input";
import Bars from "./components/Atoms/Bars/Bars";
import "./App.css";

interface CreaturesRow {
  HP: number;
}

interface TypeRow {
  name: string;
}

function App() {
  const [types, setTypes] = useState<TypeRow[]>([]);

  useEffect(() => {
    getTypes();
  }, []);

  async function getTypes() {
    const { data, error } = await supabase.from("Types").select("name");
    if (error) {
      console.error("Supabase error:", error.message);
      return;
    }
    setTypes(data ?? []);
  }

  const [creatures, setCreatures] = useState<CreaturesRow[]>([]);

  useEffect(() => {
    getCreatures();
  }, []);

  async function getCreatures() {
    const { data, error } = await supabase.from("Creatures").select("HP");
    if (error) {
      console.error("Supabase error:", error.message);
      return;
    }
    setCreatures(data ?? []);
  }

  return (
    <>
      {/* number input */}
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input type="number" label="Quantity" />
        </form>
      </section>

      {/* xp and health bar */}
      {/* dummy creature is fixed, fix when we have a user with a creature to test with */}
      <section>
        <Bars current={75} max={creatures[0]?.HP} variant="hp" />
        <Bars current={1250} max={2000} variant="xp" />
      </section>

      {/* database display typing */}
      <ul>
        {types.map((typeRow) => (
          <li key={typeRow.name}>{typeRow.name}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
