import { useEffect, useState } from 'react';
import WorkIcon from '@mui/icons-material/Work';
import StarsIcon from '@mui/icons-material/Stars';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HelpIcon from '@mui/icons-material/Help';
import paymentMethods from '../../../assets/images/payment-methods.svg';
import { Link, useLocation } from 'react-router-dom';
import storeInformation from '../../../utils/storeInformation';

const footerLinks = [
  {
    title: "about",
    links: [
      {
        name: "Contact Us",
        redirect: "/contact",
      },
      {
        name: "About Us",
        redirect: "https://www.flipkart.com/about-us",
      },
      {
        name: "Careers",
        redirect: "https://www.flipkartcareers.com",
      },
      {
        name: "Flipkart Stories",
        redirect: "https://stories.flipkart.com",
      },
      {
        name: "Press",
        redirect: "https://stories.flipkart.com/category/top-stories/news",
      },
      {
        name: "Flipkart Wholesale",
        redirect: "https://www.flipkartwholesale.com",
      },
      {
        name: "Corporate Information",
        redirect: "https://www.flipkart.com/corporate-information",
      },
    ]
  },
  {
    title: "help",
    links: [
      {
        name: "Payments",
        redirect: "https://www.flipkart.com/pages/payments",
      },
      {
        name: "Shipping",
        redirect: "https://www.flipkart.com/pages/shipping",
      },
      {
        name: "Cancellation & Returns",
        redirect: "https://www.flipkart.com/helpcentre?catalog=55c9c6edb000002e002c1701&view=CATALOG",
      },
      {
        name: "FAQ",
        redirect: "https://www.flipkart.com/helpcentre?catalog=55c9c8e2b0000023002c1702&view=CATALOG",
      },
      {
        name: "Admin Login",
        redirect: "/admin/login",
      }
    ]
  },
  {
    title: "policy",
    links: [
      {
        name: "Return Policy",
        redirect: "/return-policy",
      },
      {
        name: "Terms Of Use",
        redirect: "https://www.flipkart.com/pages/terms",
      },
      {
        name: "Security",
        redirect: "https://www.flipkart.com/pages/paymentsecurity",
      },
      {
        name: "Privacy",
        redirect: "/privacy-policy",
      },
      {
        name: "Sitemap",
        redirect: "https://www.flipkart.com/sitemap",
      },
      {
        name: "EPR Compliance",
        redirect: "https://www.flipkart.com/pages/ewaste-compliance-tnc",
      },
    ]
  },
  {
    title: "social",
    links: [
      {
        name: "Facebook",
        redirect: "https://www.facebook.com/flipkart",
      },
      {
        name: "Twitter",
        redirect: "https://twitter.com/flipkart",
      },
      {
        name: "YouTube",
        redirect: "https://www.youtube.com/flipkart",
      }
    ]
  }
]

const Footer = () => {

  const location = useLocation();
  const [adminRoute, setAdminRoute] = useState(false);

  useEffect(() => {
    setAdminRoute(location.pathname.split("/", 2).includes("admin"))
  }, [location]);

  return (
    <>
      {!adminRoute && (
        <>
          <footer className="mt-20 w-full py-1 sm:py-4 px-4 sm:px-12 bg-primary-darkBlue text-white text-xs border-b border-gray-600 flex flex-col sm:flex-row">
            <div className="grid w-full grid-cols-2 gap-4 sm:w-7/12 sm:grid-cols-4 sm:gap-2">

              {footerLinks.map((el, i) => (
                <div className="min-w-0 flex flex-col gap-2 my-3 sm:my-6" key={i}>
                  <h2 className="text-primary-grey mb-2 uppercase">{el.title}</h2>
                  {el.links.map((item, i) => (
                    item.redirect.startsWith("/") ? (
                      <Link to={item.redirect} className="hover:underline" key={i}>{item.name}</Link>
                    ) : (
                      <a href={item.redirect} target="_blank" rel="noreferrer" className="hover:underline" key={i}>{item.name}</a>
                    )
                  ))}

                </div>
              ))}

            </div>

            <div className="border-gray-600 h-36 w-1 border-l mr-5 mt-6 hidden sm:block"></div>
            <div className="w-full sm:w-5/12 my-6 sm:mx-0 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between">
              <div className="w-full sm:w-1/2">
                <h2 className="text-primary-grey">Mail Us:</h2>
                <p className="mt-2 leading-5">
                  {storeInformation.legalName},<br />
                  {storeInformation.address.map((line) => <span key={line}>{line}<br /></span>)}
                </p>
              </div>

              <div className="w-full sm:w-1/2">
                <h2 className="text-primary-grey">Registered Office Address:</h2>
                <p className="mt-2 leading-5">{storeInformation.legalName},<br />
                  {storeInformation.address.map((line) => <span key={line}>{line}<br /></span>)}
                  CIN : U51109KA2012PTC066107<br />
                  Telephone: <a className="text-primary-blue" href={`tel:${storeInformation.phone.replace(/\s/g, '')}`}>{storeInformation.phone}</a>
                </p>
              </div>
            </div>

          </footer>
          {/* <!-- footer ends --> */}

          <div className="px-4 sm:px-6 lg:px-16 py-6 w-full bg-primary-darkBlue hidden sm:flex flex-wrap gap-x-4 gap-y-4 justify-between items-center text-sm text-white">
            <a href="https://seller.flipkart.com/sell-online" target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <span className="text-yellow-400"><WorkIcon sx={{ fontSize: "20px" }} /></span> Sell On Flipkart
            </a>
            <a href="https://brands.flipkart.com" target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <span className="text-yellow-400"><StarsIcon sx={{ fontSize: "20px" }} /></span> Advertise
            </a>
            <a href="https://www.flipkart.com/the-gift-card-store" rel="noreferrer" target="_blank" className="flex items-center gap-2">
              <span className="text-yellow-400"><CardGiftcardIcon sx={{ fontSize: "20px" }} /></span> Gift Cards
            </a>
            <a href="https://www.flipkart.com/helpcentre" target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <span className="text-yellow-400"><HelpIcon sx={{ fontSize: "20px" }} /></span> Help Center
            </a>

            <span>&copy; 2007-{new Date().getFullYear()} Flipkart.com</span>
            <img draggable="false" src={paymentMethods} alt="Card Payment" />
          </div>
        </>
      )}
    </>
  )
};

export default Footer;
