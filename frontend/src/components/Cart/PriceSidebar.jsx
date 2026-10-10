
const PriceSidebar = ({ cartItems }) => {
    const getValidOriginalPrice = (item) => {
        const originalPrice = Number(item.cuttedPrice);
        return Number.isFinite(originalPrice) && originalPrice > Number(item.price)
            ? originalPrice
            : Number(item.price) || 0;
    };
    const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const originalTotal = cartItems.reduce((sum, item) => sum + getValidOriginalPrice(item) * item.quantity, 0);
    const sellingTotal = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const discount = originalTotal - sellingTotal;

    return (
        <div className="flex flex-col md:sticky md:top-16 md:h-screen md:w-4/12 md:px-1">

            {/* <!-- nav tiles --> */}
            <div className="flex flex-col bg-white rounded-sm shadow">
                <h1 className="px-6 py-3 border-b font-medium text-gray-500">PRICE DETAILS</h1>

                <div className="flex flex-col gap-4 p-6 pb-3">
                    <p className="flex justify-between">Price ({itemCount} {itemCount === 1 ? 'item' : 'items'}) <span>₹{originalTotal.toLocaleString('en-IN')}</span></p>
                    <p className="flex justify-between">Discount <span className="text-primary-green">- ₹{discount.toLocaleString('en-IN')}</span></p>
                    <p className="flex justify-between">Delivery Charges <span className="text-primary-green">FREE</span></p>

                    <div className="border border-dashed"></div>
                    <p className="flex justify-between text-lg font-medium">Total Amount <span>₹{sellingTotal.toLocaleString('en-IN')}</span></p>
                    <div className="border border-dashed"></div>

                    {discount > 0 && <p className="font-medium text-primary-green">You will save ₹{discount.toLocaleString('en-IN')} on this order</p>}

                </div>

            </div>
            {/* <!-- nav tiles --> */}

        </div>
    );
};

export default PriceSidebar;
