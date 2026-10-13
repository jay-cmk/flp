import { Link } from 'react-router-dom';

const Product = ({ image, name, offer, tag }) => {
    return (
        <Link to="/products" className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3 text-center">
            <div className="h-24 w-24 overflow-hidden rounded-lg bg-gray-50 p-2 transition-transform duration-150 ease-out hover:scale-[1.03] sm:h-28 sm:w-28">
                <img draggable="false" className="h-full w-full object-contain" src={image} alt={name} />
            </div>
            <h2 className="mt-1 max-w-[140px] text-xs font-medium text-gray-800 sm:text-sm">{name}</h2>
            <span className="text-xs font-medium text-primary-green sm:text-sm">{offer}</span>
            <span className="text-[11px] text-gray-500 sm:text-sm">{tag}</span>
        </Link>
    );
};

export default Product;
