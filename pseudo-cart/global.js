import { RenderTarget as o } from "framer";
import { useEffect as a } from "react";
export class PseudoCart {
    constructor() {
        (this.storageKey = "pseudo-cart"), (this.listeners = {});
    }
    addListener(e, t) {
        this.listeners[e] ? this.listeners[e].push(t) : (this.listeners[e] = [t]);
    }
    removeListener(e, t) {
        this.listeners[e] &&
            (this.listeners[e] = this.listeners[e].filter((i) => i !== t));
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
        this.items.findIndex((i) => i.key === e.key) == -1 &&
            (this.items = [...this.items, e]),
            this.dispatchEvent("itemschange", this.items);
    }
    removeItem(e) {
        (this.items = this.items.filter((t) => t.key !== e.key)),
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
        const n = this.items[i],
            c = n.count + t;
        if (c < 1) {
            this.removeItem(n);
            return;
        }
        const m = Object.assign(Object.assign({}, n), { count: c });
        (this.items = this.items.map((r) => (r.key === n.key ? m : r))),
            this.dispatchEvent("#" + n.key, m),
            this.dispatchEvent("itemchange", n);
    }
    clear() {
        localStorage.removeItem(this.storageKey);
        this.dispatchEvent("itemschange", this.items);
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
            if (!PseudoFunc.getInCanvas())
                return (
                    PseudoCart.Instance.addListener("itemschange", s),
                    e && s(PseudoCart.Instance.items),
                    () => {
                        PseudoCart.Instance.removeListener("itemschange", s);
                    }
                );
        }, []);
    },
    useItemChange: (s, e) => {
        a(() => {
            if (!PseudoFunc.getInCanvas())
                return (
                    PseudoCart.Instance.addListener("itemchange", s),
                    e && s(PseudoCart.Instance.items),
                    () => {
                        PseudoCart.Instance.removeListener("itemchange", s);
                    }
                );
        }, []);
    },
    useTargetItemChange: (s, e) => {
        a(() => {
            if (PseudoFunc.getInCanvas()) return;
            const t = PseudoFunc.findDataKey(e.current);
            if (t)
                return (
                    PseudoCart.Instance.addListener("#" + t, s),
                    () => {
                        PseudoCart.Instance.removeListener("#" + t, s);
                    }
                );
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
