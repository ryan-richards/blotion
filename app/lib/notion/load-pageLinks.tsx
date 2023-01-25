import {
  getFeaturedBlogPosts,
  pageToPostTransformerStorage,
} from "./notion-api";

export default async function getPageLinks(
  pageObject: any,
  decryptedToken: string
) {
  let pageLinks: any[] = [];

  if (pageObject && pageObject.posts != "") {
    const posts = await getFeaturedBlogPosts(
      pageObject.posts,
      decryptedToken
    ).then();
    posts.map(async (page: any) => {
      const post = await pageToPostTransformerStorage(page);
      pageLinks.push(post);
    });
  }

  return pageLinks;
}
