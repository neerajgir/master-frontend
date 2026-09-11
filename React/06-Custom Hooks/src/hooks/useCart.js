import { useState, useEffect, useMemo } from "react";

export function useCart() {
    const [cart, setCart] = useState(()=>{
        try {
            const savedCart = localStorage.getItem("cart");
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Failed to load cart from localstorage", error);
            return [];
        }
    });

    //persist cart to localstorage
    useEffect(()=>{
        try {
            localStorage.setItem("cart", JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save cart to localstorage", error);
        }
    }, [cart]);

    //Sync across tabs
    useEffect(()=>{
        const handleStorage = (e)=>{
            if (e.key === "cart") {
                try {
                    const newCart = JSON.parse(e.newValue || "[]");
                    setCart(newCart);
                } catch (error) {
                    console.error("Failed to parse cart from localstorage", error);
                }
            }
        }   
        
        window.addEventListener("storage", handleStorage);
        return ()=>{
            window.removeEventListener("storage", handleStorage);
        }
    }, []);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = useMemo(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    const totalPrice = useMemo(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [cart]);

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };
}