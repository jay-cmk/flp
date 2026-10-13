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
        <form onSubmit={handleSubmit} className="flex w-full min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-md bg-white px-2 py-1.5 shadow-sm sm:px-3 sm:py-2">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="min-w-0 w-full flex-1 border-none bg-transparent text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none" type="text" placeholder="Search for products, brands and more" aria-label="Search products" />
            <button type="submit" className="flex min-h-7 min-w-7 items-center justify-center rounded-md text-primary-blue transition-colors hover:bg-gray-100" aria-label="Search"><SearchIcon sx={{ fontSize: 18 }} /></button>
        </form>
    );
};

export default Searchbar;
