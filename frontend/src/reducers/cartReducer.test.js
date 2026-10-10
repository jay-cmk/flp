import { removeItemsFromCart } from '../actions/cartAction';
import { REMOVE_FROM_CART, UPDATE_CART_ITEM_QUANTITY } from '../constants/cartConstants';
import { cartReducer } from './cartReducer';

describe('cartReducer', () => {
    it('removes only the selected product variant', () => {
        const state = {
            cartItems: [
                { product: 'product-1', variant: 'blue', quantity: 1 },
                { product: 'product-1', variant: 'red', quantity: 2 },
                { product: 'product-2', quantity: 1 },
            ],
            shippingInfo: {},
        };

        const updated = cartReducer(state, {
            type: REMOVE_FROM_CART,
            payload: { product: 'product-1', variant: 'blue' },
        });

        expect(updated.cartItems).toEqual([
            { product: 'product-1', variant: 'red', quantity: 2 },
            { product: 'product-2', quantity: 1 },
        ]);
    });

    it('persists cart changes after removing an item', async () => {
        let state = {
            cartItems: [
                { product: 'product-1', quantity: 1 },
                { product: 'product-2', quantity: 1 },
            ],
            shippingInfo: {},
        };
        const dispatch = (action) => {
            state = cartReducer(state, action);
        };

        await removeItemsFromCart({ product: 'product-1' })(dispatch, () => ({ cart: state }));

        expect(state.cartItems).toEqual([{ product: 'product-2', quantity: 1 }]);
        expect(JSON.parse(localStorage.getItem('cartItems'))).toEqual(state.cartItems);
    });

    it('does not re-add a removed item when an earlier quantity change completes', () => {
        const state = {
            cartItems: [{ product: 'product-2', quantity: 1 }],
            shippingInfo: {},
        };

        const updated = cartReducer(state, {
            type: UPDATE_CART_ITEM_QUANTITY,
            payload: { product: 'product-1', quantity: 2 },
        });

        expect(updated.cartItems).toEqual(state.cartItems);
    });
});
