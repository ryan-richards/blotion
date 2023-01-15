import { Stack, Text, Button } from "@chakra-ui/react";
import { Link as RemixLink, useNavigate } from "@remix-run/react";
import { Box, Flex, chakra, HStack, Image, useColorModeValue, Link, AspectRatio } from '@chakra-ui/react';
import TimeAgo from 'timeago-react';
import { useEffect, useState } from "react";

export default function BlogCard({ post }: any) {

    const nav = useNavigate()
    const [time, setTime] = useState()

    useEffect(() => {
        setTime(post.date)
    }, [])

    return (
        <Box
            rounded="lg"
            boxShadow={'shadow'}
            bg={useColorModeValue("gray.100", "gray.700")}
            maxW={750}
            overflow={'hidden'}
        >
            <Box>
                <Flex direction={{ base: "column", md: "row" }} justify={'space-between'}>
                    <Flex>
                        <AspectRatio minW={{ base: 'full', md: 250 }} ratio={6 / 4} mr={5}>
                            <Image display={'flex'} objectFit='contain' src={post?.cover} />
                        </AspectRatio>
                    </Flex>

                    <Flex p={4}>
                        <Box mt={{ base: 2, md: 0 }} minW={250}>
                            <Link
                                as={RemixLink}
                                to={`/blog/${post.slug}`}
                                fontSize={'xl'}
                                fontWeight='medium'
                                prefetch='intent'>
                                {post.title}
                            </Link>

                            <Flex alignItems="center" mt={1}>
                                <Text
                                    style={{ marginTop: 0 }}
                                    fontSize="sm"
                                    color={useColorModeValue("gray.600", "gray.300")}
                                >
                                    <TimeAgo datetime={time ? time : ''} />
                                </Text>
                            </Flex>


                            <Text
                                style={{ marginTop: 5 }}
                                fontSize="sm"
                                color={useColorModeValue("gray.800", "gray.400")
                                }
                                noOfLines={3}
                                minW={'320px'}
                                maxWidth={'600px'}
                            >
                                {post.description}
                            </Text>


                        </Box>
                    </Flex>
                    <Flex justify={'flex-end'} align={'end'} mt={{ base: 5 }} mr={2} mb={2}>
                        <Button as={RemixLink} to={`/blog/${post.slug}`} prefetch='intent' variant={'link'} p={5}>Read More</Button>
                    </Flex>
                </Flex>
            </Box>
        </Box>
    )
}