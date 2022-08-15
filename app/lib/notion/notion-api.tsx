import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";


export const getPublishedBlogPosts = async (pageID: string, token: string) => {

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // list blog posts
    const response = await notion.databases.query({
        database_id: pageID,
        sorts: [
            {
                property: 'Updated',
                direction: 'descending'
            }
        ],
    });

    const dbResults = response.results;

    return dbResults
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
    }

    if (results.length === 0) {
        console.log('maybe its a database?')
        const dbResults = await getPublishedBlogPosts(pageID, token);

        let markdown = 'none'

        return { dbResults, markdown }
    }

    results.map(async (block: any) => {
        //loop through the blocks and find the blog post database id
        if (block.type === 'child_database') {
            pageObject.posts = block.id
        }
    })

    const mdBlocks = await n2m.blocksToMarkdown(results);

    //const mdBlocks = await n2m.pageToMarkdown(pageID)
    let parentBlockOnly: any[] | undefined = [];
    let nav: any[] | undefined = [];

    console.log(mdBlocks)

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
        console.log('maybe its a database?')
        const dbResults = await getPublishedBlogPosts(pageID, token);

        let markdown = 'none'

        return { dbResults, markdown }
    }

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

    console.log(parentBlockOnly)
    let markdown = n2m.toMarkdownString(parentBlockOnly);

    return {
        pageObject,
        markdown
    }
}

export const getSingleBlogPost = async (pageID: string, token: string, slug: string) => {
    let post, markdown

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // list of blog posts
    const response = await notion.databases.query({
        database_id: pageID,
        filter: {
            property: 'slug',
            rich_text: {
                equals: slug // slug
            },
            // add option for tags in the future
        },
        sorts: [
            {
                property: 'Updated',
                direction: 'descending'
            }
        ]
    });

    if (!response.results[0]) {
        throw 'No results available'
    }

    // grab page from notion
    const page = response.results[0];

    const { results } = await notion.blocks.children.list({
        block_id: page.id,
    });

    const mdBlocks = await n2m.pageToMarkdown(page.id)
    markdown = n2m.toMarkdownString(mdBlocks);
    //post = NotionService.pageToPostTransformer(page);

    return {
        //post,
        markdown
    }
}