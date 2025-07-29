import { RenderTarget as o } from "framer"
import { useEffect as a } from "react"

function getTieredPrice(count, pricing) {
    const { moq = 1, price1, qty2, price2, qty3, price3 } = pricing

    if (count >= qty3) return price3
    if (count >= qty2) return price2
    if (count >= moq) return price1
    return price1
}

export class PseudoCart {
    constructor() {
        this.storageKey = "pseudo-cart"
        this.listeners = {}
    }

    addListener(e, t) {
        this.listeners[e] ? this.listeners[e].push(t) : (this.listeners[e] = [t])
    }

    removeListener(e, t) {
        this.listeners[e] && (this.listeners[e] = this.listeners[e].filter((i) => i !== t))
    }

    dispatchEvent(e, t) {
        if (this.listeners[e]) for (const i of this.listeners[e]) i(t)
    }

    get items() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || []
        } catch {
            return []
        }
    }

    set items(e) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(e))
        } catch (t) {
            console.warn("cart failed to store", t)
        }
    }

    addItem(e) {
        const index = this.items.findIndex((i) => i.key === e.key)
        const count = e.count || 1

        const pricing = {
            moq: e.moq,
            price1: e.price1,
            qty2: e.qty2,
            price2: e.price2,
            qty3: e.qty3,
            price3: e.price3
        }

        const unitPrice = getTieredPrice(count, pricing)
        const updatedItem = {
            ...e,
            count,
            unitPrice,
            total: unitPrice * count,
            ...pricing
        }

        if (index === -1) {
            this.items = [...this.items, updatedItem]
        } else {
            const existing = this.items[index]
            const newCount = existing.count + count
            const newUnitPrice = getTieredPrice(newCount, pricing)
            const updated = {
                ...existing,
                count: newCount,
                unitPrice: newUnitPrice,
                total: newUnitPrice * newCount
            }
            this.items = this.items.map((item, i) => (i === index ? updated : item))
        }

        this.dispatchEvent("itemschange", this.items)
    }

    removeItem(e) {
        this.items = this.items.filter((t) => t.key !== e.key)
        this.dispatchEvent("itemschange", this.items)
    }

    containsItem(e) {
        return this.items.some((t) => t.key === e)
    }

    getItem(e) {
        return this.items.find((t) => t.key === e)
    }

    updateItemCount(e, t) {
        const index = this.items.findIndex((r) => r.key === e)
        if (index === -1) return

        const item = this.items[index]
        const newCount = item.count + t
        if (newCount < 1) {
            this.removeItem(item)
            return
        }

        const pricing = {
            moq: item.moq,
            price1: item.price1,
            qty2: item.qty2,
            price2: item.price2,
            qty3: item.qty3,
            price3: item.price3
        }

        const newUnitPrice = getTieredPrice(newCount, pricing)
        const updated = {
            ...item,
            count: newCount,
            unitPrice: newUnitPrice,
            total: newUnitPrice * newCount
        }

        this.items = this.items.map((r) => (r.key === item.key ? updated : r))
        this.dispatchEvent("#" + item.key, updated)
        this.dispatchEvent("itemchange", updated)
    }

    clear() {
        localStorage.removeItem(this.storageKey)
        this.dispatchEvent("itemschange", this.items)
    }

    static get Instance() {
        return PseudoCart.e || (PseudoCart.e = new PseudoCart()), this.e
    }
}

export const PseudoFunc = {
    getInCanvas: () => o.current() !== o.preview,
    findElement: (s) => {
        if (s) return s.closest("[data-cart-key]")
    },
    findDataKey: (s) => {
        const e = PseudoFunc.findElement(s)
        if (e) return e.dataset.cartKey
    },
    findCartItem: (s) => {
        const e = PseudoFunc.findDataKey(s)
        if (e) return PseudoCart.Instance.getItem(e)
    },
    findItem: (s) => {
        const e = PseudoFunc.findElement(s)
        if (!e) return
        const t = e.dataset.cartKey
        if (!t) return
        const i = PseudoCart.Instance.getItem(t)
        return i || e.cartData
    },
    useItemsChange: (s, e) => {
        a(() => {
            if (!PseudoFunc.getInCanvas())
                return (
                    PseudoCart.Instance.addListener("itemschange", s),
                    e && s(PseudoCart.Instance.items),
                    () => {
                        PseudoCart.Instance.removeListener("itemschange", s)
                    }
                )
        }, [])
    },
    useItemChange: (s, e) => {
        a(() => {
            if (!PseudoFunc.getInCanvas())
                return (
                    PseudoCart.Instance.addListener("itemchange", s),
                    e && s(PseudoCart.Instance.items),
                    () => {
                        PseudoCart.Instance.removeListener("itemchange", s)
                    }
                )
        }, [])
    },
    useTargetItemChange: (s, e) => {
        a(() => {
            if (PseudoFunc.getInCanvas()) return
            const t = PseudoFunc.findDataKey(e.current)
            if (t)
                return () => {
                    PseudoCart.Instance.addListener("#" + t, s)
                    return () => {
                        PseudoCart.Instance.removeListener("#" + t, s)
                    }
                }
        }, [])
    }
}

export default function h(s) {
    return (
        (window.PseudoCart = PseudoCart),
        (window.PseudoFunc = PseudoFunc),
        (e) => React.createElement(s, Object.assign({}, e))
    )
}
