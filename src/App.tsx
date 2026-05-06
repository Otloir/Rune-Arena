import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase"; // use the shared client

interface TypeRow {
  name: string;
}

function App() {
  const [types, setTypes] = useState<TypeRow[]>([]);

  useEffect(() => {
    getTypes();
  }, []);

  async function getTypes() {
    const { data, error } = await supabase.from("Types").select();
    if (error) {
      console.error("Supabase error:", error.message);
      return;
    }
    setTypes(data ?? []);
  }

  return (
    <ul>
      {types.map((types) => (
        <li key={types.name}>{types.name}</li>
      ))}
    </ul>
  );
}

export default App;