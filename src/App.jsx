import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

const App = () => {
  return (
    <Routes>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Routes>
  );
};

export default App;