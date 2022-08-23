import { getPublishedBlogPosts } from "./notion-api";

export default async function getPageLinks(pageObject: any, decryptedToken: string) {

    let pageLinks: { title: any; slug: string; }[] = []

    if (pageObject && pageObject.posts != '') {
        const posts = await getPublishedBlogPosts(pageObject.posts, decryptedToken)
        posts.map((page: any) => {
            //console.log(page.properties.Status)
            let pageLink = {
                title: page.properties.Name.title[0].plain_text,
                slug: page.properties.Slug.formula.string,
                date: page.properties.Updated.last_edited_time,
            }
            pageLinks.push(pageLink)
        })
    }

    return pageLinks

}