const PriceSidebar = ({ cartItems = [] }) => {
    const getValidOriginalPrice = (item) => {
        const originalPrice = Number(item.cuttedPrice);
        return Number.isFinite(originalPrice) && originalPrice > Number(item.price)
            ? originalPrice
            : Number(item.price) || 0;
    };
    const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const originalTotal = cartItems.reduce((sum, item) => sum + getValidOriginalPrice(item) * Number(item.quantity || 0), 0);
    const sellingTotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * Number(item.quantity || 0), 0);
    const discount = Math.max(0, originalTotal - sellingTotal);

    return (
        <aside className="h-fit w-full rounded-xl border border-gray-100 bg-white shadow-sm md:sticky md:top-20 md:w-[340px] md:flex-shrink-0">
            <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold tracking-wide text-gray-500">PRICE DETAILS</h2>
            <div className="flex flex-col gap-3 p-4 text-sm">
                <p className="flex justify-between gap-3">
                    <span>Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span>₹{originalTotal.toLocaleString('en-IN')}</span>
                </p>
                <p className="flex justify-between gap-3">
                    <span>Discount</span>
                    <span className="text-primary-green">− ₹{discount.toLocaleString('en-IN')}</span>
                </p>
                <p className="flex justify-between gap-3">
                    <span>Delivery</span>
                    <span className="font-medium text-primary-green">FREE</span>
                </p>
                <div className="border-t border-dashed border-gray-300" />
                <p className="flex justify-between gap-3 text-base font-semibold">
                    <span>Total payable</span>
                    <span>₹{sellingTotal.toLocaleString('en-IN')}</span>
                </p>
                <div className="border-t border-dashed border-gray-300" />
                {discount > 0 && (
                    <p className="text-xs font-medium text-primary-green">
                        You save ₹{discount.toLocaleString('en-IN')} on this order
                    </p>
                )}
                <p className="text-[11px] leading-relaxed text-gray-500">
                    Total uses store-supplied product prices. The checkout API does not calculate a separate tax line; delivery is free.
                </p>
            </div>
        </aside>
    );
};

export default PriceSidebar;
