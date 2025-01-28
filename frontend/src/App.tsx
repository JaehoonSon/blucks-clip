import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainChat from "./Pages/MainChat";
import HomePage from "./Pages/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/chat" element={<MainChat />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
