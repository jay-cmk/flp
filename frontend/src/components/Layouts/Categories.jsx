import mobiles from '../../assets/images/Categories/phone.png';
import fashion from '../../assets/images/Categories/fashion.png';
import electronics from '../../assets/images/Categories/electronics.png';
import home from '../../assets/images/Categories/home.png';
import travel from '../../assets/images/Categories/travel.png';
import appliances from '../../assets/images/Categories/appliances.png';
import furniture from '../../assets/images/Categories/furniture.png';
import beauty from '../../assets/images/Categories/beauty.png';
import grocery from '../../assets/images/Categories/grocery.png';
import { Link } from 'react-router-dom';

const catNav = [
    {
        name: "Mobiles",
        icon: mobiles,
    },
    {
        name: "Fashion",
        icon: fashion,
    },
    {
        name: "Electronics",
        icon: electronics,
    },
    {
        name: "Home",
        icon: home,
    },
    {
        name: "Travel",
        icon: travel,
    },
    {
        name: "Appliances",
        icon: appliances,
    },
    {
        name: "Furniture",
        icon: furniture,
    },
    {
        name: "Beauty,Toys & more",
        icon: beauty,
    },
    {
        name: "Grocery",
        icon: grocery,
    },
]

const Categories = () => {
    return (
        <section className="mt-2 w-full overflow-hidden rounded-b-lg bg-white shadow-sm ring-1 ring-gray-100">
            <div className="hide-scrollbar flex items-stretch gap-3 overflow-x-auto px-3 py-3 sm:gap-5 sm:px-5">
                {catNav.map((item, i) => (
                    <Link to={`/products?category=${item.name}`} className="group flex min-w-[72px] flex-col items-center gap-2 rounded-md px-1 py-2 text-center sm:min-w-[90px]" key={i}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 p-2 sm:h-14 sm:w-14">
                            <img draggable="false" className="h-full w-full object-contain" src={item.icon} alt={item.name} />
                        </div>
                        <span className="text-[11px] font-medium leading-tight text-gray-800 transition-colors group-hover:text-primary-blue sm:text-xs">{item.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default Categories;
