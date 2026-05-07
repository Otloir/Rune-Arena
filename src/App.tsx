import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase"; // use the shared client
import Input from "./components/Atoms/Form/Input";
import "./App.css";

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

  return (
    <>
      {/* number input */}
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input type="number" label="Quantity" />
        </form>
      </section>

      {/* typing */}
      <ul>
        {types.map((typeRow) => (
          <li key={typeRow.name}>{typeRow.name}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
