"use strict";
import { RenderTarget as E } from "framer";
import { useEffect as p } from "react";

export class PseudoCart {
    constructor() {
        Object.defineProperty(this, "storageKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "pseudo-cart",
        }),
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {},
        });
    }

    addListener(e, t) {
        this.listeners[e] ? this.listeners[e].push(t) : (this.listeners[e] = [t]);
    }

    removeListener(e, t) {
        this.listeners[e] = this.listeners[e]?.filter((l) => l !== t);
    }

    dispatchEvent(e, t) {
        if (this.listeners[e]) for (const l of this.listeners[e]) l(t);
    }

    get items() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch {
            return [];
        }
    }

    set items(e) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(e));
        } catch (t) {
            console.warn("cart failed to store", t);
        }
    }

    addItem(e) {
        const existing = this.items.find((l) => l.key === e.key);
        if (!existing) {
            this.items = [...this.items, e];
            this.dispatchEvent("itemschange", this.items);
        }
    }

    removeItem(e) {
        this.items = this.items.filter((t) => t.key !== e.key);
        this.dispatchEvent("itemschange", this.items);
    }

    containsItem(e) {
        return this.items.some((t) => t.key === e);
    }

    // 🧠 Tiered Pricing Logic
    getPrice(item) {
        const count = item.count || 1;
        const {
            moq = 1,
            price1,
            qty2,
            price2,
            qty3,
            price3
        } = item;

        if (qty3 && count >= qty3) return price3;
        if (qty2 && count >= qty2) return price2;
        if (moq && count >= moq) return price1;

        return item.price || 0;
    }

    getItem(key) {
        const item = this.items.find((t) => t.key === key);
        if (item) {
            item.price = this.getPrice(item);
        }
        return item;
    }

    updateItemCount(e, t) {
        const index = this.items.findIndex((g) => g.key === e);
        if (index === -1) return;

        const oldItem = this.items[index];
        const newCount = oldItem.count + t;

        if (newCount < 1) {
            this.removeItem(oldItem);
            return;
        }

        const updatedItem = {
            ...oldItem,
            count: newCount,
            price: this.getPrice({ ...oldItem, count: newCount }),
        };

        this.items = this.items.map((g) => g.key === oldItem.key ? updatedItem : g);
        this.items = [...this.items];

        this.dispatchEvent("#" + oldItem.key, updatedItem);
        this.dispatchEvent("itemchange", oldItem);
    }

    clear() {
        localStorage.removeItem(this.storageKey);
        this.dispatchEvent("itemschange", []);
    }

    static get Instance() {
        return PseudoCart.e || (PseudoCart.e = new PseudoCart()), this.e;
    }
}

export const PseudoFunc = {
    getInCanvas: () => E.current() !== E.preview,

    findElement: (I) => {
        return I?.closest("[data-cart-key]");
    },

    findDataKey: (I) => {
        const e = PseudoFunc.findElement(I);
        return e?.dataset.cartKey;
    },

    findCartItem: (I) => {
        const e = PseudoFunc.findDataKey(I);
        return e && PseudoCart.Instance.getItem(e);
    },

    findItem: (I) => {
        const e = PseudoFunc.findElement(I);
        if (!e) return;
        const key = e.dataset.cartKey;
        return key && (PseudoCart.Instance.getItem(key) || e.cartData);
    },

    useItemsChange: (I, e) => {
        p(() => {
            if (!PseudoFunc.getInCanvas()) {
                PseudoCart.Instance.addListener("itemschange", I);
                e && I(PseudoCart.Instance.items);
                return () => {
                    PseudoCart.Instance.removeListener("itemschange", I);
                };
            }
        }, []);
    },

    useItemChange: (I, e) => {
        p(() => {
            if (!PseudoFunc.getInCanvas()) {
                PseudoCart.Instance.addListener("itemchange", I);
                e && I(PseudoCart.Instance.items);
                return () => {
                    PseudoCart.Instance.removeListener("itemchange", I);
                };
            }
        }, []);
    },

    useTargetItemChange: (I, e) => {
        p(() => {
            if (PseudoFunc.getInCanvas()) return;
            const key = PseudoFunc.findDataKey(e.current);
            if (key) {
                PseudoCart.Instance.addListener("#" + key, I);
                return () => {
                    PseudoCart.Instance.removeListener("#" + key, I);
                };
            }
        }, []);
    },
};

export default function w(I) {
    window.PseudoCart = PseudoCart;
    window.PseudoFunc = PseudoFunc;
    return (e) => <I {...e} />;
}
