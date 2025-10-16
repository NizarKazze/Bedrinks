import { Routes, Route } from 'react-router-dom';
import Index from './Pages/Index.jsx';
import InsertProduct from './Pages/InsertProduct.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/new-product" element={<InsertProduct />} />
    </Routes>
  );
}

export default App;
