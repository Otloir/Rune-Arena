import Input from "./components/atoms/input/input";
import "./App.css";

function App() {
  return (
    <>
      <section id="center">
        <form action="buy">
          <Input type="text" label="hi" />
          <Input />
          <button>submit</button>
        </form>
      </section>
    </>
  );
}

export default App;
