import { Routes, Route } from 'react-router-dom';
import Index from './Pages/Index.jsx';
import InsertProduct from './Pages/InsertProduct.jsx';
import MainControlPanel from './Pages/MainControlPanel.jsx';
import ProductFilter from './Pages/ProductControlPanel.jsx';
import { ProposalProvider } from './Components/Context/ProposalProvider.jsx';

function App() {
  return (
    <ProposalProvider>
      <Routes>
        <Route path="/" element={<ProductFilter></ProductFilter>} />
        <Route path='/main-control-panel' element={<MainControlPanel></MainControlPanel>} />
        <Route path='/proposal-preview' element={<Index></Index>} />
        <Route path="/new-product" element={<InsertProduct />} />
        <Route path="*" element={<Index />} />  {/* fallback para cualquier ruta */}
      </Routes>
    </ProposalProvider>

  );
}

export default App;
