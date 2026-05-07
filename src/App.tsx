import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase"; // use the shared client
import Item from "./components/atoms/Item"; // example component to display shop items


function App() {

  return (
    <ul>
        <Item itemId={1} /> 
    </ul>
  );
}

export default App;
