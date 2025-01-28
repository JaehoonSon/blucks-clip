import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Test from "./Pages/test";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
