import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Banner.css';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import gadgetSale from '../../../assets/images/Banners/gadget-sale.jpg';
import kitchenSale from '../../../assets/images/Banners/kitchen-sale.jpg';
import poco from '../../../assets/images/Banners/poco-m4-pro.webp';
import realme from '../../../assets/images/Banners/realme-9-pro.webp';
import fashionSale from '../../../assets/images/Banners/fashionsale.jpg';
import oppo from '../../../assets/images/Banners/oppo-reno7.webp';

export const PreviousBtn = ({ className, onClick }) => {
  return (
    <div className={className} onClick={onClick}>
      <ArrowBackIosIcon sx={{ fontSize: 16 }} />
    </div>
  )
}

export const NextBtn = ({ className, onClick }) => {
  return (
    <div className={className} onClick={onClick}>
      <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
    </div>
  )
}

const Banner = () => {

  const settings = {
    autoplay: true,
    autoplaySpeed: 3000,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
    swipeToSlide: true,
    prevArrow: <PreviousBtn />,
    nextArrow: <NextBtn />,
  };

  const banners = [gadgetSale, kitchenSale, poco, fashionSale, realme, oppo];

  return (
    <>
      <section className="relative w-full overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-100">
        <Slider {...settings} className="banner-slider">
          {banners.map((el, i) => (
            <img draggable="false" className="h-44 w-full object-cover sm:h-60 md:h-72" src={el} alt="banner" key={i} />
          ))}
        </Slider>
      </section>
    </>
  );
};

export default Banner;
