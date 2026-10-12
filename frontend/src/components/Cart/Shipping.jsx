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
import { useLocation, useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import states from '../../utils/states';

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
            <main className="w-full mt-20">
                <div className="flex flex-col md:flex-row gap-3.5 w-full md:w-11/12 mt-0 md:mt-4 m-auto md:mb-7 overflow-hidden px-2 sm:px-0">
                    <div className="flex-1">
                        <Stepper activeStep={1} items={checkoutItems}>
                            <div className="w-full bg-white">
                                <form onSubmit={shippingSubmit} autoComplete="off" className="flex flex-col justify-start gap-3 w-full sm:w-3/4 px-3 sm:px-0 sm:mx-8 my-4">
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

                                    <button type="submit" className="bg-primary-orange w-full sm:w-1/3 my-2 py-3.5 text-sm font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none">save and deliver here</button>
                                </form>
                            </div>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={checkoutItems} />
                </div>
            </main>
        </>
    );
};

export default Shipping;
