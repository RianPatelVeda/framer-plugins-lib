import { RenderTarget as o } from "framer";
import { useEffect as a } from "react";

export class PseudoCart {
    constructor() {
        this.storageKey = "pseudo-cart";
        this.listeners = {};
    }

    addListener(e, t) {
        this.listeners[e] ? this.listeners[e].push(t) : (this.listeners[e] = [t]);
    }

    removeListener(e, t) {
        this.listeners[e] = this.listeners[e]?.filter((i) => i !== t) || [];
    }

    dispatchEvent(e, t) {
        if (this.listeners[e]) for (const i of this.listeners[e]) i(t);
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
        const index = this.items.findIndex((i) => i.key === e.key);
        if (index === -1) {
            // Add subtotal and base price
            const startingCount = e.count || 1;
            const moq = parseInt(e.moq || "1");
            const qty2 = parseInt(e.qty2 || "0");
            const qty3 = parseInt(e.qty3 || "0");
            const price1 = parseFloat(e.price1 || "0");
            const price2 = parseFloat(e.price2 || "0");
            const price3 = parseFloat(e.price3 || "0");

            let unitPrice = price1;
            if (qty3 && startingCount >= qty3) unitPrice = price3;
            else if (qty2 && startingCount >= qty2) unitPrice = price2;

            const newItem = {
                ...e,
                count: startingCount,
                moq,
                qty2,
                qty3,
                price1,
                price2,
                price3,
                price: unitPrice,
                subtotal: startingCount * unitPrice,
            };

            this.items = [...this.items, newItem];
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

    getItem(e) {
        return this.items.find((t) => t.key === e);
    }

    updateItemCount(e, t) {
        const i = this.items.findIndex((r) => r.key === e);
        if (i === -1) return;

        const n = this.items[i];
        const newCount = n.count + t;

        if (newCount < 1) {
            this.removeItem(n);
            return;
        }

        // 🧠 Dynamic Pricing Logic
        const { moq = 1, price1 = 0, qty2 = 0, price2 = 0, qty3 = 0, price3 = 0 } = n;
        let dynamicPrice = price1;

        if (qty3 && newCount >= qty3) {
            dynamicPrice = price3;
        } else if (qty2 && newCount >= qty2) {
            dynamicPrice = price2;
        }

        const updatedItem = {
            ...n,
            count: newCount,
            price: dynamicPrice,
            subtotal: newCount * dynamicPrice,
        };

        this.items = this.items.map((r) => (r.key === n.key ? updatedItem : r));
        this.dispatchEvent("#" + n.key, updatedItem);
        this.dispatchEvent("itemchange", updatedItem);
        this.dispatchEvent("itemschange", this.items);
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
    getInCanvas: () => o.current() !== o.preview,

    findElement: (s) => {
        if (s) return s.closest("[data-cart-key]");
    },

    findDataKey: (s) => {
        const e = PseudoFunc.findElement(s);
        return e?.dataset.cartKey;
    },

    findCartItem: (s) => {
        const e = PseudoFunc.findDataKey(s);
        if (e) return PseudoCart.Instance.getItem(e);
    },

    findItem: (s) => {
        const e = PseudoFunc.findElement(s);
        if (!e) return;
        const t = e.dataset.cartKey;
        if (!t) return;
        const i = PseudoCart.Instance.getItem(t);
        return i || e.cartData;
    },

    useItemsChange: (s, e) => {
        a(() => {
            if (!PseudoFunc.getInCanvas()) {
                PseudoCart.Instance.addListener("itemschange", s);
                e && s(PseudoCart.Instance.items);
                return () => {
                    PseudoCart.Instance.removeListener("itemschange", s);
                };
            }
        }, []);
    },

    useItemChange: (s, e) => {
        a(() => {
            if (!PseudoFunc.getInCanvas()) {
                PseudoCart.Instance.addListener("itemchange", s);
                e && s(PseudoCart.Instance.items);
                return () => {
                    PseudoCart.Instance.removeListener("itemchange", s);
                };
            }
        }, []);
    },

    useTargetItemChange: (s, e) => {
        a(() => {
            if (PseudoFunc.getInCanvas()) return;
            const t = PseudoFunc.findDataKey(e.current);
            if (t) {
                PseudoCart.Instance.addListener("#" + t, s);
                return () => {
                    PseudoCart.Instance.removeListener("#" + t, s);
                };
            }
        }, []);
    },
};

export default function h(s) {
    return (
        (window.PseudoCart = PseudoCart),
        (window.PseudoFunc = PseudoFunc),
        (e) => React.createElement(s, { ...e })
    );
}
