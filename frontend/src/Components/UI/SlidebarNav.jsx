import Logo from '../../assets/BeDrinks-logo.png'
import { useState } from 'react';

import { BottleWine, House, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

const SlidebarNavigation = ({toggleProposalExpanded}) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    
    return (
      <div className={`transition-all duration-300 border-r-2 border-gray-200 flex flex-col bg-white ${isSidebarCollapsed ? 'w-16' : 'w-1/4'}`}>
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
          {!isSidebarCollapsed && (
            <div id='logo' className='w-48'>
              <img src={Logo} alt="" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center gap-4 mt-4">
            <a href="#" className="p-3 hover:bg-gray-100 rounded-lg" title="Panel Principal">
            <House />
            </a>
            <a href="/product-control-panel" className="p-3 hover:bg-gray-100 rounded-lg" title="Gestión de productos">
            <BottleWine />
            </a>
            <button onClick={toggleProposalExpanded} className="p-3 hover:bg-gray-100 rounded-lg" title="Crear Propuesta">
            <FileText />
            </button>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-4">
            <a href="#" className='mb-4 mt-4'>Panel Principal</a>
            <a href="/product-control-panel" className='mb-4'>Gestión de productos</a>
            <button onClick={toggleProposalExpanded}>Crear Propuesta</button>
          </div>
        )}
      </div>
    )
}

export default SlidebarNavigation