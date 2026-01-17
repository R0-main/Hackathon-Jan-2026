import "./App.css";
import { Waitlist } from "./components/Waitlist";

function App() {
  return (
    <div className="app">
      <header>
        <h1>🚀 Coming Soon</h1>
        <p className="subtitle">Something amazing is in the works.</p>
      </header>

      <main>
        <Waitlist />
      </main>

      <footer>
        <p>ORIGIN Hackathon Paris 2026</p>
      </footer>
    </div>
  );
}

export default App;
