// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AnotherPage from "./pages/AnotherPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/another" element={<AnotherPage />} />
      </Routes>
    </Router>
  );
};

export default App;