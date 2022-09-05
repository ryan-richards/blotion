import { getFeaturedBlogPosts, getPublishedBlogPosts, pageToPostTransformer } from "./notion-api";

export default async function getPageLinks(pageObject: any, decryptedToken: string) {

    let pageLinks: { title: any; slug: string; }[] = []

    if (pageObject && pageObject.posts != '') {
        const posts = await getFeaturedBlogPosts(pageObject.posts, decryptedToken)
        posts.map((page: any) => {
            const post = pageToPostTransformer(page);
            pageLinks.push(post)
        })
    }

    return pageLinks
}