import { useState } from "react";

const InsertProduct = () => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    return(
        <div id="new-product-content" className="w-3/4 mx-auto mt-8 flex">
            
            <div className="left-slidebar flex flex-col w-2/4 p-4">
                <div className="insert-img"></div>

                <label htmlFor="code" className="mb-2">Introduce el código del producto:</label>
                <input type="text" id="input-code" name="code" value={code} placeholder="código..." className="mb-4 p-2 py-4"
                onChange={(e) => setCode(e.target.value)}/>

                <label htmlFor="name" className="mb-2">Introduce el nombre del producto:</label>
                <input type="text" id="input-name" value={name} name="name" placeholder="Introduce el nombre" className="mb-4 p-2 py-4"
                onChange={(e) => setName(e.target.value)}/>
                
                <label htmlFor="desc" className="mb-2">Introduce la descripción del producto:</label>
                <textarea name="desc" id="input-desc" value={description} placeholder="Introduce el nombre" rows={6} className="mb-4 p-2 py-4"
                onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>

            <div className="right-slidebar flex flex-col w-2/4 p-4">

                <label htmlFor="code" className="mb-2">Introduce el código del producto:</label>
                <input type="text" id="input-code" name="code" value={code} placeholder="código..." className="mb-4 p-2 py-4"
                onChange={(e) => setCode(e.target.value)}/>

                <label htmlFor="name" className="mb-2">Introduce el nombre del producto:</label>
                <input type="text" id="input-name" value={name} name="name" placeholder="Introduce el nombre" className="mb-4 p-2 py-4"
                onChange={(e) => setName(e.target.value)}/>
                
                <label htmlFor="desc" className="mb-2">Introduce la descripción del producto:</label>
                <textarea name="desc" id="input-desc" value={description} placeholder="Introduce el nombre" rows={6} className="mb-4 p-2 py-4"
                onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
            
        </div>
    )
}

export default InsertProduct