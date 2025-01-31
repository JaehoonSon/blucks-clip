import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainChat from "./Pages/MainChat";
import HomePage from "./Pages/HomePage";
import LoginPage from "./Pages/LoginPage";
import { AuthProvider } from "./Contexts/AuthContexts";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/chat/:chat_id" element={<MainChat />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />}></Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
