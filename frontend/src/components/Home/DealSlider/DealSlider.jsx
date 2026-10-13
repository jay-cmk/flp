import Product from './Product';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { offerProducts } from '../../../utils/constants';
import { getRandomProducts } from '../../../utils/functions';

export const settings = {
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 5,
    slidesToScroll: 5,
    swipeToSlide: true,
    draggable: true,
    prevArrow: null,
    nextArrow: null,
    responsive: [
        {
            breakpoint: 1280,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 4,
            }
        },
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 3,
            }
        },
        {
            breakpoint: 640,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
            }
        },
        {
            breakpoint: 430,
            settings: {
                slidesToShow: 1.8,
                slidesToScroll: 1,
            }
        }
    ]
};

const DealSlider = ({ title }) => {
    return (
        <section className="w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-3 sm:px-5">
                <h1 className="text-sm font-semibold text-gray-900 sm:text-xl">{title}</h1>
                <Link to="/products" className="rounded-md bg-primary-blue px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-white shadow-sm sm:px-4 sm:text-xs">View all</Link>
            </div>

            <div className="px-1 pb-2 pt-1 sm:px-2">
                <Slider {...settings}>
                    {getRandomProducts(offerProducts, 12).map((item, i) => (
                        <Product {...item} key={i} />
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default DealSlider;
