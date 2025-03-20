"use strict"
import {
    useEffect as u,
    useRef as m,
    useState as s,
    ComponentType,
} from "react"
import {
    PseudoCart as i,
    PseudoFunc as a,
} from "https://cdn.jsdelivr.net/gh/AframeStudio/framer-plugins-lib/pseudo-cart/global.js"
export function CartItemTemplate(n): ComponentType {
    return (e) => <p.ItemTemplateComponent props={e} component={n} />
}
CartItemTemplate.displayName = "Cart Product Template"
export function Action_AddToCart(n): ComponentType {
    return (e) => <p.AddToCartComponent props={e} component={n} />
}
Action_AddToCart.displayName = "Action: Add To Cart"
export function Action_CartItemPlus(n): ComponentType {
    return (e) => (
        <p.UpdateCartCountComponent props={e} component={n} change={1} />
    )
}
Action_CartItemPlus.displayName = "Action: Cart Product +1"
export function Action_CartItemMinus(n): ComponentType {
    return (e) => (
        <p.UpdateCartCountComponent props={e} component={n} change={-1} />
    )
}
Action_CartItemMinus.displayName = "Action: Cart Product -1"
export function Action_Link(n): ComponentType {
    return (e) => <p.GotoLinkComponent props={e} component={n} />
}
Action_Link.displayName = "Action: Goto Link"
export function Action_ClearCartOnClick(n): ComponentType {
    return (e) => <p.ClearCart props={e} component={n} onClick />
}
Action_ClearCartOnClick.displayName = "Action: Reset Cart on Click"
export function Action_ClearCart(n): ComponentType {
    return (e) => <p.ClearCart props={e} component={n} />
}
Action_ClearCart.displayName = "Action: Reset Cart on Submit"
export function Hidden_WhenInCart(n): ComponentType {
    return (e) => (
        <p.HideWhenCartComponent props={e} component={n} hideWhenInCart />
    )
}
Hidden_WhenInCart.displayName = "Hidden: When Product in Cart"
export function Hidden_WhenNotInCart(n): ComponentType {
    return (e) => <p.HideWhenCartComponent props={e} component={n} />
}
Hidden_WhenNotInCart.displayName = "Hidden: When Product NOT in Cart"
export function Hidden_WhenCartEmpty(n): ComponentType {
    return (e) => (
        <p.HideWhenEmptyComponent props={e} component={n} hideWhenEmpty />
    )
}
Hidden_WhenCartEmpty.displayName = "Hidden: When Cart is Empty"
export function Hidden_WhenCartFilled(n): ComponentType {
    return (e) => <p.HideWhenEmptyComponent props={e} component={n} />
}
Hidden_WhenCartFilled.displayName = "Hidden: When Cart is Filled"
const p = {
    ItemTemplateComponent: (n) => {
        const [e, o] = s([...i.Instance.items])
        return (
            a.useItemsChange(() => o([...i.Instance.items])),
            e.map((t) => (
                <n.component key={t.key} {...n.props} data-cart-key={t.key} />
            ))
        )
    },
    AddToCartComponent: (n) => {
        const e = m(null)
        return (
            <n.component
                {...n.props}
                ref={e}
                onClick={(o) => {
                    const t = a.findElement(e.current)
                    if (t) {
                        const r = t.cartData
                        r && i.Instance.addItem({ ...r, key: r.slug, count: 1 })
                    }
                    o.stopPropagation(),
                        o.preventDefault(),
                        n.props.onClick?.(o)
                }}
            />
        )
    },
    UpdateCartCountComponent: (n) => {
        const e = m(null)
        return (
            <n.component
                {...n.props}
                ref={e}
                onClick={(o) => {
                    const t = a.findCartItem(e.current)
                    t && i.Instance.updateItemCount(t.key, n.change),
                        o.stopPropagation(),
                        o.preventDefault(),
                        n.props.onClick?.(o)
                }}
            />
        )
    },
    HideWhenEmptyComponent: (n) => {
        const e = m(null),
            o = a.getInCanvas(),
            [t, r] = s(!o)
        return (
            a.useItemsChange((c) => {
                const C = c.length > 0
                r(n.hideWhenEmpty ? !C : C)
            }, !0),
            (
                <>
                    {t ? null : <n.component {...n.props} />}
                    <div ref={e} data-test="ref" />
                </>
            )
        )
    },
    HideWhenCartComponent: (n) => {
        const e = m(null),
            o = a.getInCanvas(),
            [t, r] = s(!o)
        return (
            a.useItemsChange(() => {
                const c = a.findCartItem(e.current)
                r(n.hideWhenInCart ? !!c : !c)
            }, !0),
            (
                <>
                    {t ? null : <n.component {...n.props} />}
                    <div ref={e} data-test="ref" />
                </>
            )
        )
    },
    GotoLinkComponent: (n) => {
        const e = m(null)
        return (
            <n.component
                {...n.props}
                ref={e}
                onClick={(o) => {
                    const t = a.findCartItem(e.current)
                    t &&
                        t.linkPath &&
                        t.slug &&
                        (window.location.href = t.linkPath.replace(
                            ":slug",
                            t.slug
                        )),
                        o.stopPropagation(),
                        o.preventDefault(),
                        n.props.onClick?.(o)
                }}
            />
        )
    },
    ClearCart: (n) => {
        const e = m(null),
            o = (r) => {
                i.Instance.clear(), n.props.onClick?.(r)
            },
            t = (r) => {
                n.props.onSubmit?.(r),
                    setTimeout(() => {
                        console.log("cleared cart"), i.Instance.clear()
                    }, 500)
            }
        return (
            u(() => {
                if (!(n.onClick || !e.current))
                    return (
                        e.current.addEventListener("submit", t, {
                            capture: !0,
                        }),
                        () => {
                            e.current?.removeEventListener("submit", t, {
                                capture: !0,
                            })
                        }
                    )
            }, []),
            n.onClick || console.log(n),
            (
                <n.component
                    {...n.props}
                    ref={e}
                    onClick={n.onClick ? o : void 0}
                />
            )
        )
    },
}
