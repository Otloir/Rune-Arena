import Input from "./components/Atoms/Input/Input";
import "./App.css";

function App() {
  return (
    <>
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input type="number" label="Quantity" />
          <button>submit</button>
        </form>
      </section>
    </>
  );
}

export default App;
