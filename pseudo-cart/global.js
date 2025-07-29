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
        if (this.listeners[e]) {
            this.listeners[e] = this.listeners[e].filter((i) => i !== t);
        }
    }

    dispatchEvent(e, t) {
        if (this.listeners[e]) {
            for (const i of this.listeners[e]) i(t);
        }
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

    _getPriceForQuantity(item, quantity) {
        const { moq, price1, qty2, price2, qty3, price3 } = item;

        if (!moq || !price1) return item.price || 0;

        const q = parseInt(quantity);
        const m = parseInt(moq);
        const q2 = parseInt(qty2);
        const p2 = parseFloat(price2);
        const q3 = parseInt(qty3);
        const p3 = parseFloat(price3);
        const p1 = parseFloat(price1);

        if (q >= q3 && q3 > 0) return p3;
        if (q >= q2 && q2 > 0) return p2;
        return p1;
    }

    getItemTotal(item) {
        const price = this._getPriceForQuantity(item, item.count || 1);
        return price * (item.count || 1);
    }

    addItem(e) {
        const existingIndex = this.items.findIndex((i) => i.key === e.key);
        if (existingIndex === -1) {
            this.items = [...this.items, e];
        }
        this.dispatchEvent("itemschange", this.items);
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

        const updated = {
            ...n,
            count: newCount,
            dynamicPrice: this._getPriceForQuantity(n, newCount),
        };

        this.items = this.items.map((r) => (r.key === n.key ? updated : r));

        this.dispatchEvent("#" + n.key, updated);
        this.dispatchEvent("itemchange", updated);
    }

    clear() {
        localStorage.removeItem(this.storageKey);
        this.dispatchEvent("itemschange", []);
    }

    static get Instance() {
        return this.e || (this.e = new PseudoCart()), this.e;
    }
}

export const PseudoFunc = {
    getInCanvas: () => o.current() !== o.preview,

    findElement: (s) => {
        if (s) return s.closest("[data-cart-key]");
    },

    findDataKey: (s) => {
        const e = PseudoFunc.findElement(s);
        if (e) return e.dataset.cartKey;
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
                if (e) s(PseudoCart.Instance.items);
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
                if (e) s(PseudoCart.Instance.items);
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
        (e) => React.createElement(s, Object.assign({}, e))
    );
}
