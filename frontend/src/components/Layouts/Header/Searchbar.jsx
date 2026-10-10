import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Searchbar = () => {

    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if(keyword.trim()){
            navigate(`/products/${keyword}`)
        } else {
            navigate('/products');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full min-w-0 sm:w-9/12 px-2 sm:px-4 py-1.5 flex justify-between items-center shadow-md bg-white rounded-sm overflow-hidden">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="min-w-0 w-0 text-sm flex-1 outline-none border-none placeholder-gray-500" type="text" placeholder="Search products, brands and more" aria-label="Search products" />
            <button type="submit" className="min-h-8 min-w-8 flex items-center justify-center text-primary-blue" aria-label="Search"><SearchIcon /></button>
        </form>
    );
};

export default Searchbar;
