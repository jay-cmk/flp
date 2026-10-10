import { ADD_TO_CART, EMPTY_CART, REMOVE_FROM_CART, SAVE_SHIPPING_INFO, UPDATE_CART_ITEM_QUANTITY } from "../constants/cartConstants";

const getCartLineKey = (item) => {
    if (!item || typeof item !== 'object') return `${item}:null`;
    return `${item.product}:${JSON.stringify(item.variant ?? null)}`;
};

export const cartReducer = (state = { cartItems: [], shippingInfo: {} }, { type, payload }) => {
    switch (type) {
        case ADD_TO_CART:
            const item = payload;
            const isItemExist = state.cartItems.find((el) => getCartLineKey(el) === getCartLineKey(item));

            if (isItemExist) {
                return {
                    ...state,
                    cartItems: state.cartItems.map((el) =>
                        getCartLineKey(el) === getCartLineKey(isItemExist) ? item : el
                    ),
                }
            } else {
                return {
                    ...state,
                    cartItems: [...state.cartItems, item],
                }
            }
        case REMOVE_FROM_CART:
            return {
                ...state,
                cartItems: state.cartItems.filter((el) => getCartLineKey(el) !== getCartLineKey(payload))
            }
        case UPDATE_CART_ITEM_QUANTITY:
            return {
                ...state,
                cartItems: state.cartItems.map((el) =>
                    getCartLineKey(el) === getCartLineKey(payload)
                        ? { ...el, quantity: payload.quantity }
                        : el
                )
            }
        case EMPTY_CART:
            return {
                ...state,
                cartItems: [],
            }
        case SAVE_SHIPPING_INFO:
            return {
                ...state,
                shippingInfo: payload
            }
        default:
            return state;
    }
}