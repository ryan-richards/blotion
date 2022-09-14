import { NotionToMarkdown } from "notion-to-md";
import { Client } from "@notionhq/client";
import { capitalize, capitalizeEachWord } from "../utils/slugify";
import React from "react";
import * as md from "../utils/md"
import { marked } from "marked";


export const getTagBlogPosts = async (pageID: string, token: string, tag: string) => {
    const notion = new Client({ auth: token })
    // list blog posts
    const response = await notion.databases.query({
        database_id: pageID,
        filter: {
            and: [
                {
                    property: 'Status',
                    select: {
                        equals: 'Live',
                    }
                },
                {
                    or: [
                        {
                            property: 'Tags',
                            multi_select: {
                                contains: capitalizeEachWord(tag),
                            }
                        },
                        {
                            property: 'Tags',
                            multi_select: {
                                contains: tag,
                            }
                        },
                    ]
                }
            ]
        },
        sorts: [
            {
                property: 'Updated',
                direction: 'descending',
            }
        ]
    });

    let dbResults = null

    dbResults = response.results;

    return dbResults
}

export const getFeaturedBlogPosts = async (pageID: string, token: string) => {
    const notion = new Client({ auth: token })
    // list blog posts
    const response = await notion.databases.query({
        database_id: pageID,
        filter: {
            and: [
                {
                    property: 'Status',
                    select: {
                        equals: 'Live',
                    }
                },
                {
                    property: 'Tags',
                    multi_select: {
                        contains: 'Featured',
                    }
                },
            ]
        },
        sorts: [
            {
                property: 'Updated',
                direction: 'descending',
            }
        ],
        page_size: 5,
    });

    let dbResults = null
    //If there are no featured posts, list 3 recent posts
    if (response.results.length < 1) {
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
            page_size: 3,
        });

        return dbResults = response.results
    }

    dbResults = response.results;

    return dbResults
}


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

    n2m.setCustomTransformer('embed', async (block) => {
        const { embed } = block as any;
        if (!embed?.url) return '';
        return `<figure>
  <iframe src="${embed?.url}"></iframe>
  <figcaption>${await n2m.blockToMarkdown(embed?.caption)}</figcaption>
</figure>`;
    });

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

    //console.log(results)

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

    //console.log(mdBlocks)
    mdBlocks.map((block: any) => {

      

        if (block.parent.charAt(0) != '[') {

            let newBlock

            if (block.type === 'column_list') {
                //loop through text and split into array using \n\n as split point
                let textArray = block.parent.split('\n\n')

                let html = ''

                textArray.map((text: any) => {
                    //if text starts with a ![] then is an image
                    if (text.startsWith('![')) {
                        //extract link from between ()
                        let link = text.split('(')[1].split(')')[0]
                        html = html + `<div><img src="${link}" /></div>`
                    } else {
                        let parsedHTML = marked(text)
                        html = html + `<div>${parsedHTML}</div>`
                    }
                })

               

                newBlock = {
                    parent: `<div class='grid-container'>
                       ${html}
                    </div>
                    `,
                }

            } else {
                newBlock = {
                    parent: block.parent,
                }

            }



            parentBlockOnly?.push(newBlock)
        }

    })

    let markdown = n2m.toMarkdownString(parentBlockOnly);


    return {
        pageObject,
        markdown,
    }
}

export const getNotionNav = async (pageID: string, token: string) => {

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    const { results } = await notion.blocks.children.list({
        block_id: pageID
    });

    const mdBlocks = await n2m.blocksToMarkdown(results);

    let nav: any[] | undefined = [];

    mdBlocks.map((block: any) => {
        //console.log(block)
        if (block.parent.includes('[') && !block.parent.includes('http')) {
            nav?.push(block)
        }
    })
    return {
        nav
    }
}

export const getNotionSubPagebyID = async (pageID: string, token: string) => {

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    n2m.setCustomTransformer('embed', async (block) => {
        const { embed } = block as any;
        if (!embed?.url) return '';
        return `<figure>
  <iframe src="${embed?.url}"></iframe>
  <figcaption>${await n2m.blockToMarkdown(embed?.caption)}</figcaption>
</figure>`;
    });

    const { results } = await notion.blocks.children.list({
        block_id: pageID
    });

    //console.log(results)

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

        let newBlock

        if (block.type === 'column_list') {
         
            //loop through text and split into array using \n\n as split point
            let textArray = block.parent.split('\n\n')

            let html = ''

            textArray.map((text: any) => {
                //if text starts with a ![] then is an image
                if (text.startsWith('![')) {
                    //extract link from between ()
                    let link = text.split('(')[1].split(')')[0]
                    html = html + `<div><img src="${link}" /></div>`
                } else {
                    let parsedHTML = marked(text)
                    html = html + `<div>${parsedHTML}</div>`
                }
            })

            newBlock = {
                parent: `<div class='grid-container'>
                   ${html}
                </div>
                `,
            }

        } else {
            newBlock = {
                parent: block.parent,
            }
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


    const assetStyle: React.CSSProperties = {}

    const notion = new Client({ auth: token });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    n2m.setCustomTransformer('embed', async (block) => {
        const { embed } = block as any;
        if (!embed?.url) return '';
        return `<figure>
  <iframe src="${embed?.url}"></iframe>
  <figcaption>${await n2m.blockToMarkdown(embed?.caption)}</figcaption>
</figure>`;
    });

    const codeBlock = (text: string, language?: string) => {
        if (language === "plain text") language = "text";
        return `\`\`\`${language || ""}\n${text}\n\`\`\``;
    };

    n2m.setCustomTransformer('code', async (block) => {
        const { code } = block as any;
        if (!code?.rich_text[0].plain_text) return '';
        if (code?.rich_text[0].plain_text.includes('### EMBED')) {
            let codeText = code?.rich_text[0].plain_text
            let codeTextTrimmed = codeText?.replace('### EMBED', '')
            let codeTextTrimmed2 = codeTextTrimmed?.replace('### EMBED', '')
            return codeTextTrimmed2
        }

        if (!code.rich_text[0].plain_text.includes('### EMBED')) {
            let codeText = code?.rich_text[0].plain_text
            return codeBlock(codeText, code?.language);
        }
        return ''
    });

    n2m.setCustomTransformer('video', async (block) => {
        const { video } = block as any;
        if (!video?.external.url) return '';
        let src = video?.external.url
        return `<figure>
        <iframe width="640" height="360"  style="--aspect-ratio: 640 / 360" src=${src} frameborder="0" title="embeded_video" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></figure>
        `;
    });

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

export const pageToPostTransformer = (page: any) => {

    let cover = page.cover;
    let description = page.properties.Description ? page.properties.Description : null
    let tags = page.properties.Tags

    //console.log(page)

    if (cover) {
        if (cover.type === 'file') {
            cover = cover.file.url
        } else {
            cover = cover.external.url;
        }

    } else {
        // default cover
        cover = 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80';
    }

    if (description && description.rich_text.length > 0) {
        description = description.rich_text[0].plain_text
    } else {
        description = page.properties.Name.title[0].plain_text
    }

    if (tags.multi_select.length > 0) {
        tags = tags.multi_select
        //console.log(tags)
    } else {
        tags = []
    }

    return {
        id: page.id,
        cover: cover,
        tags: tags,
        title: page.properties.Name.title[0].plain_text,
        description: description,
        date: page.properties.Updated.last_edited_time,
        slug: page.properties.Slug.formula.string,
    }
}
