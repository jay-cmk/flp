import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { useSnackbar } from 'notistack';
import { saveShippingInfo } from '../../actions/cartAction';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import states from '../../utils/states';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Shipping = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    const { cartItems } = useSelector((state) => state.cart);
    const checkoutItems = location.state?.checkoutItems || cartItems;
    const { shippingInfo } = useSelector((state) => state.cart);

    const [name, setName] = useState(shippingInfo?.name || '');
    const [email, setEmail] = useState(shippingInfo?.email || '');
    const [address, setAddress] = useState(shippingInfo?.address || '');
    const [city, setCity] = useState(shippingInfo?.city || '');
    const country = 'IN';
    const [state, setState] = useState(shippingInfo?.state || '');
    const [pincode, setPincode] = useState(shippingInfo?.pincode || '');
    const [phoneNo, setPhoneNo] = useState(shippingInfo?.phoneNo || '');

    const shippingSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            enqueueSnackbar('Please enter your full name', { variant: 'error' });
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            enqueueSnackbar('Please enter a valid email address', { variant: 'error' });
            return;
        }

        if (phoneNo.length < 10 || phoneNo.length > 10) {
            enqueueSnackbar('Invalid Phone Number', { variant: 'error' });
            return;
        }

        dispatch(saveShippingInfo({ name, email, address, city, country, state, pincode, phoneNo }));
        navigate('/order/confirm', { state: { checkoutItems } });
    }

    return (
        <>
            <MetaData title="Flipkart: Shipping Details" />
            <main className="mx-auto w-full max-w-6xl px-3 pb-28 pt-16 sm:px-5 md:pb-8">
                <header className="mb-3 flex items-center gap-2 rounded-xl bg-white px-2 py-2 shadow-sm sm:px-4">
                    <Link to="/cart" aria-label="Back to cart" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100">
                        <ArrowBackIcon />
                    </Link>
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Checkout</p>
                        <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Delivery address</h1>
                    </div>
                </header>
                {checkoutItems.length === 0 ? (
                    <section className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                        <p className="font-medium text-gray-800">Your cart is empty.</p>
                        <Link to="/products" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary-blue px-5 font-medium text-white">Browse products</Link>
                    </section>
                ) : (
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="min-w-0 flex-1">
                        <Stepper activeStep={1} items={checkoutItems}>
                            <form id="shipping-address-form" onSubmit={shippingSubmit} autoComplete="on" className="flex w-full flex-col gap-3 p-4 sm:p-6">
                                    <TextField
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        fullWidth
                                        label="Full Name"
                                        variant="outlined"
                                        required
                                    />

                                    <TextField
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        fullWidth
                                        label="Email (optional)"
                                        variant="outlined"
                                        type="email"
                                    />

                                    <TextField
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        fullWidth
                                        label="Address"
                                        variant="outlined"
                                        required
                                    />

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                        <TextField
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            type="number"
                                            label="Pincode"
                                            fullWidth
                                            variant="outlined"
                                            required
                                        />
                                        <TextField
                                            value={phoneNo}
                                            onChange={(e) => setPhoneNo(e.target.value)}
                                            type="number"
                                            label="Phone No"
                                            fullWidth
                                            variant="outlined"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                        <TextField
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            label="City"
                                            fullWidth
                                            variant="outlined"
                                            required
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                                        <FormControl fullWidth>
                                            <InputLabel id="country-select">Country</InputLabel>
                                            <Select
                                                labelId="country-select"
                                                id="country-select"
                                                value={country}
                                                disabled
                                                label="Country"
                                            >
                                                <MenuItem value={'IN'}>India</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl fullWidth>
                                            <InputLabel id="state-select">State</InputLabel>
                                            <Select
                                                labelId="state-select"
                                                id="state-select"
                                                value={state}
                                                label="State"
                                                onChange={(e) => setState(e.target.value)}
                                                required
                                            >
                                                {states.map((item) => (
                                                    <MenuItem key={item.code} value={item.code}>{item.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <button type="submit" className="mt-2 hidden min-h-12 w-full rounded-lg bg-primary-orange px-5 text-sm font-semibold uppercase text-white shadow-sm hover:shadow-md sm:w-64 md:block">Save and deliver here</button>
                            </form>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={checkoutItems} />
                </div>
                )}
            </main>
            {checkoutItems.length > 0 && (
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 px-3 pt-3 shadow-[0_-4px_14px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
                <div className="mx-auto max-w-6xl pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                    <button form="shipping-address-form" type="submit" className="min-h-12 w-full rounded-lg bg-primary-orange px-5 text-sm font-semibold uppercase text-white shadow-sm">
                        Save and continue
                    </button>
                </div>
            </div>
            )}
        </>
    );
};

export default Shipping;
