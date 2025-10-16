import ProductList from '../Components/Product.jsx';
import CountryList from '../Components/Country.jsx';
import TypeList from '../Components/Type.jsx';

function Index() {
  return (
    <div className='content'>
      <ProductList />
      <CountryList></CountryList>
      <TypeList></TypeList>
    </div>
    
  );
}

export default Index;
