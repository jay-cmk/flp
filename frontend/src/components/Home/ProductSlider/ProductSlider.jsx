import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { getRandomProducts } from '../../../utils/functions';
import { settings } from '../DealSlider/DealSlider';
import Product from './Product';

const ProductSlider = ({ title, tagline }) => {

    const { loading, products } = useSelector((state) => state.products);

    return (
        <section className="w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-5">
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-sm font-semibold text-gray-900 sm:text-xl">{title}</h1>
                    <p className="text-[11px] text-gray-500 sm:text-sm">{tagline}</p>
                </div>
                <Link to="/products" className="rounded-md bg-primary-blue px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm sm:px-4 sm:text-xs">View all</Link>
            </div>

            {loading ? null :
                <div className="px-1 pb-2 pt-1 sm:px-2">
                    <Slider {...settings}>
                        {products && getRandomProducts(products, 12).map((product) => (
                            <Product {...product} key={product._id} />
                        ))}
                    </Slider>
                </div>
            }
        </section>
    );
};

export default ProductSlider;
