import { Flex, Link, Text } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";
import TimeAgo from "timeago-react";

export default function BlogTextLink({ page }: any) {


    return (
        <Link as={RemixLink} to={`/blog/${page.slug}`} prefetch='intent'>
            <Flex justify={'space-between'}>
                <Text maxW={{ base: '250px', md: 'full' }}>
                    {page.title}
                </Text>
                <TimeAgo style={{ fontSize: '14px' }} datetime={page.date} />
            </Flex>
        </Link>
    )
}