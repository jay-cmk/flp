import axios from "axios"
import { ADD_TO_CART, EMPTY_CART, REMOVE_FROM_CART, SAVE_SHIPPING_INFO, UPDATE_CART_ITEM_QUANTITY } from "../constants/cartConstants";

// add to cart
export const addItemsToCart = (id, quantity = 1, variant) => async (dispatch, getState) => {
    const { data } = await axios.get(`/api/v1/product/${id}`);

    dispatch({
        type: ADD_TO_CART,
        payload: {
            product: data.product._id,
            name: data.product.name,
            seller: data.product.brand.name,
            price: data.product.price,
            cuttedPrice: data.product.cuttedPrice,
            image: data.product.images[0].url,
            stock: data.product.stock,
            quantity,
            ...(variant === undefined ? {} : { variant }),
        },
    });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

// remove cart item
export const removeItemsFromCart = (item) => async (dispatch, getState) => {

    dispatch({
        type: REMOVE_FROM_CART,
        payload: item,
    });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

export const updateCartItemQuantity = (item, quantity) => async (dispatch, getState) => {
    dispatch({
        type: UPDATE_CART_ITEM_QUANTITY,
        payload: { ...item, quantity },
    });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

// empty cart
export const emptyCart = () => async (dispatch, getState) => {

    dispatch({ type: EMPTY_CART });

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

// save shipping info
export const saveShippingInfo = (data) => async (dispatch) => {

    dispatch({
        type: SAVE_SHIPPING_INFO,
        payload: data,
    });

    localStorage.setItem('shippingInfo', JSON.stringify(data));
}