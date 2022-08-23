import { json } from "@remix-run/node";

export default async function navData(nav: any) {

    let navItems: { title: any, slug: any }[] = []

    //Check if nav is empty
    if (nav && nav.length > 0) {
        nav.map((item: any) => {

            let page = item.parent

            let id = page.substring(
                page.indexOf("(") + 1,
                page.lastIndexOf(")")
            )

            let pageName = page.substring(
                page.indexOf("[") + 1,
                page.lastIndexOf(']'))

            let pageLink = {
                title: pageName,
                slug: id,
            }
            navItems.push(pageLink)
        })
    }

    return navItems

}