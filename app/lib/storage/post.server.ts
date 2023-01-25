import { supabaseDB } from "~/lib/storage/db.access";

const table = {
  postDBTable: "sites",
};

export async function getPostListings() {
  return supabaseDB
    .from(table.postDBTable)
    .select("id,title,description,slug,updated_at,thumbnail,category")
    .order("created_at", { ascending: false });
}

export async function getPostListingsByCategory(category: string) {
  return supabaseDB
    .from(table.postDBTable)
    .select("id,title,description,slug,updated_at,thumbnail,category")
    .eq("category", category)
    .order("created_at", { ascending: false });
}

export async function getRecentPosts() {
  return supabaseDB
    .from(table.postDBTable)
    .select("id,title,description,slug,updated_at,thumbnail")
    .order("created_at", { ascending: false })
    .limit(5);
}

export async function getPosts(user: any) {
  return supabaseDB
    .from(table.postDBTable)
    .select("*")
    .eq("author", user)
    .order("created_at", { ascending: false });
}

export async function getPost(slug: string) {
  return supabaseDB
    .from(table.postDBTable)
    .select("*")
    .eq("slug", slug)
    .single();
}

export async function createPost(post: any) {
  return supabaseDB.from(table.postDBTable).insert([
    {
      slug: post.slug,
      markdown: post.markdown,
      title: post.title,
      author: post.user,
      description: post.description,
      thumbnail: post?.thumbnail,
      category: post?.category,
    },
  ]);
}

export async function createSite(siteDetails: any) {
  return supabaseDB.from(table.postDBTable).insert([
    {
      owner: siteDetails.owner,
      site_name: siteDetails.site_name,
      index_page: siteDetails.index_id,
    },
  ]);
}

export async function updatePost(slug: string, post: any) {
  return supabaseDB
    .from(table.postDBTable)
    .update([
      {
        slug: post.slug,
        markdown: post.markdown,
        title: post.title,
        description: post.description,
        thumbnail: post?.thumbnail,
        category: post?.category,
      },
    ])
    .match({ slug: slug });
}

export async function deletePost(slug: string) {
  return supabaseDB.from(table.postDBTable).delete().match({ slug: slug });
}
