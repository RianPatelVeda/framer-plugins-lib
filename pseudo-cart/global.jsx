"use strict";
import { RenderTarget as E } from "framer";
import { useEffect as p } from "react";
export class PseudoCart {
    constructor() {
        Object.defineProperty(this, "storageKey", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: "pseudo-cart",
        }),
            Object.defineProperty(this, "listeners", {
                enumerable: !0,
                configurable: !0,
                writable: !0,
                value: {},
            });
    }
    addListener(e, t) {
        this.listeners[e] ? this.listeners[e].push(t) : (this.listeners[e] = [t]);
    }
    removeListener(e, t) {
        this.listeners[e] &&
            (this.listeners[e] = this.listeners[e].filter((l) => l !== t));
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
        this.items.findIndex((l) => l.key === e.key) == -1 &&
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
        const l = this.items.findIndex((g) => g.key === e);
        if (l === -1) return;
        const y = this.items[l],
            k = y.count + t;
        if (k < 1) {
            this.removeItem(y);
            return;
        }
        const v = { ...y, count: k };
        (this.items = this.items.map((g) => (g.key === y.key ? v : y))),
            (this.items = [...this.items]),
            this.dispatchEvent("#" + y.key, v),
            this.dispatchEvent("itemchange", y);
    }
    clear() {
        localStorage.removeItem(this.storageKey);
    }
    static get Instance() {
        return PseudoCart.e || (PseudoCart.e = new PseudoCart()), this.e;
    }
}
export const PseudoFunc = {
    getInCanvas: () => E.current() !== E.preview,
    findElement: (I) => {
        if (I) return I.closest("[data-cart-key]");
    },
    findDataKey: (I) => {
        const e = PseudoFunc.findElement(I);
        if (e) return e.dataset.cartKey;
    },
    findCartItem: (I) => {
        const e = PseudoFunc.findDataKey(I);
        if (e) return PseudoCart.Instance.getItem(e);
    },
    findItem: (I) => {
        const e = PseudoFunc.findElement(I);
        if (!e) return;
        const t = e.dataset.cartKey;
        if (!t) return;
        const l = PseudoCart.Instance.getItem(t);
        return l || e.cartData;
    },
    useItemsChange: (I, e) => {
        p(() => {
            if (!PseudoFunc.getInCanvas())
                return (
                    PseudoCart.Instance.addListener("itemschange", I),
                    e && I(PseudoCart.Instance.items),
                    () => {
                        PseudoCart.Instance.removeListener("itemschange", I);
                    }
                );
        }, []);
    },
    useItemChange: (I, e) => {
        p(() => {
            if (!PseudoFunc.getInCanvas())
                return (
                    PseudoCart.Instance.addListener("itemchange", I),
                    e && I(PseudoCart.Instance.items),
                    () => {
                        PseudoCart.Instance.removeListener("itemchange", I);
                    }
                );
        }, []);
    },
    useTargetItemChange: (I, e) => {
        p(() => {
            if (PseudoFunc.getInCanvas()) return;
            const t = PseudoFunc.findDataKey(e.current);
            if (t)
                return (
                    PseudoCart.Instance.addListener("#" + t, I),
                    () => {
                        PseudoCart.Instance.removeListener("#" + t, I);
                    }
                );
        }, []);
    },
};
export default function w(I) {
    return (
        (window.PseudoCart = PseudoCart),
        (window.PseudoFunc = PseudoFunc),
        (e) => <I {...e} />
    );
}
