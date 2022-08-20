import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";


export const getPublishedBlogPosts = async (pageID: string, token: string) => {

    const notion = new Client({ auth: token })

    // list blog posts
    const response = await notion.databases.query({
        database_id: pageID,
        filter: {
            property: 'Status',
            select: {
                equals: 'Live',
            }
        },
        sorts: [
            {
                property: 'Updated',
                direction: 'descending',
            }
        ],
    });


    const dbResults = response.results;

    return dbResults
}

export const getDatabaseName = async (pageID: string, token: string) => {
    const notion = new Client({ auth: token })
    const database = await notion.databases.retrieve({ database_id: pageID });
    const databaseName = database.title[0].plain_text;
    return databaseName
}

export const getDBid = async (pageID: string, token: string) => {
    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    const response = await notion.pages.retrieve({ page_id: pageID });

    return {
        response
    }

}

export const getNotionPagebyID = async (pageID: string, token: string) => {

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    const { results } = await notion.blocks.children.list({
        block_id: pageID
    });

    let pageObject = {
        index: '',
        posts: '',
        postsTitle: ''
    }

    if (results.length === 0) {
        //console.log('maybe its a database?')
        const dbResults = await getPublishedBlogPosts(pageID, token);
        let markdown = 'none'

        return { dbResults, markdown }
    }

    results.map(async (block: any) => {
        //loop through the blocks and find the blog post database id
        if (block.type === 'child_database') {
            pageObject.posts = block.id
            pageObject.postsTitle = block.child_database.title
        }
    })

    const mdBlocks = await n2m.blocksToMarkdown(results);

    //const mdBlocks = await n2m.pageToMarkdown(pageID)
    let parentBlockOnly: any[] | undefined = [];
    let nav: any[] | undefined = [];

    //console.log(mdBlocks)

    mdBlocks.map((block: any) => {
        if (block.parent.charAt(0) != '[') {
            let newBlock = {
                parent: block.parent,
            }
            parentBlockOnly?.push(newBlock)
        } else if (block.parent.includes('[')) {
            nav?.push(block)
        }
    })

    let markdown = n2m.toMarkdownString(parentBlockOnly);

    return {
        nav,
        pageObject,
        markdown,
    }
}

export const getNotionSubPagebyID = async (pageID: string, token: string) => {

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    const { results } = await notion.blocks.children.list({
        block_id: pageID
    });

    console.log(results)

    const pageObject = {
        index: '',
        posts: '',
    }

    if (results.length === 0) {
        //console.log('maybe its a database?')
        const dbResults = await getPublishedBlogPosts(pageID, token);
        const databaseName = await getDatabaseName(pageID, token);
        let markdown = 'none'
        return { dbResults, markdown, databaseName }
    }

    const response = await notion.pages.properties.retrieve({ page_id: pageID, property_id: 'title' });
    //const response = await notion.pages.retrieve({ page_id: pageID });
    let pageTitle = response.results[0].title.plain_text

    results.map((block: any) => {
        //loop through the blocks and find the blog post database id
        if (block.type === 'child_database') {
            pageObject.posts = block.id
        }
    })

    const mdBlocks = await n2m.blocksToMarkdown(results);

    //const mdBlocks = await n2m.pageToMarkdown(pageID)
    let parentBlockOnly: any[] | undefined = [];

    mdBlocks.map((block: any) => {
        let newBlock = {
            parent: block.parent,
        }
        parentBlockOnly?.push(newBlock)
    })

    let markdown = n2m.toMarkdownString(parentBlockOnly);

    return {
        pageTitle,
        pageObject,
        markdown
    }
}

export const getSingleBlogPost = async (pageID: string, token: string, slug: string) => {
    let post, markdown

    //console.log(slug)

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // list of blog posts
    const response = await notion.databases.query({
        database_id: pageID,
        filter: {
            property: "Slug",
            formula: {
                string: {
                    equals: slug, // slug
                },
            },
            // add option for tags in the future
        },
    });

    //console.log(response)

    if (!response.results[0]) {
        throw 'No results available'
    }

    // grab page from notion
    const page = response.results[0];

    const mdBlocks = await n2m.pageToMarkdown(page.id)
    markdown = n2m.toMarkdownString(mdBlocks);
    post = pageToPostTransformer(page);

    return {
        post,
        markdown
    }
}

const pageToPostTransformer = (page: any) => {

    console.log(page)

    let cover = page.cover;

    if (cover) {
        cover = cover.external.url;
    } else {
        // default cover
        cover = 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80';
    }

    return {
        id: page.id,
        cover: cover,
        title: page.properties.Name.title[0].plain_text,
        date: page.properties.Updated.last_edited_time,
        slug: page.properties.Slug.formula.string,
    }
}
