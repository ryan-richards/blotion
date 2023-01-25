//Types for Notion Services Integration

export type Tag = {
  color: string;
  id: string;
  name: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  tags: Tag[];
  description: string;
  date: string;
  thumbnail: string;
};

export type PostPage = {
  post: BlogPost;
  markdown: string;
};
