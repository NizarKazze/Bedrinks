import { Routes, Route } from 'react-router-dom';
import Index from './Pages/Index.jsx';
import InsertProduct from './Pages/InsertProduct.jsx';
import MainControlPanel from './Pages/MainControlPanel.jsx';
import ProductFilter from './Pages/ProductControlPanel.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path='/main-control-panel' element={<MainControlPanel></MainControlPanel>} />
      <Route path='/product-control-panel' element={<ProductFilter></ProductFilter>} />
      <Route path="/new-product" element={<InsertProduct />} />
    </Routes>
  );
}

export default App;
