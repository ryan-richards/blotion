import { Avatar, AvatarGroup, Box, Heading, Text } from "@chakra-ui/react"

const JoinOthers = () => {
    return (
        <Box display={"flex"} flexDirection={"column"} textAlign={"center"} maxW={{ base: "80%", md: "40%" }} gap={2}>
            <AvatarGroup size='md' max={4} justifyContent={"center"}>
                <Avatar name='smcn' src='https://pbs.twimg.com/profile_images/1695179553755246592/kuYRtY6E_400x400.jpg' />
                <Avatar name='heyzoish' src='https://pbs.twimg.com/profile_images/1677039503402311680/RpC39JId_400x400.jpg' />
                <Avatar name='neon' src='https://pbs.twimg.com/profile_images/1647941650767806464/4fb99V0z_400x400.jpg' />
                <Avatar name='blabs' src='https://pbs.twimg.com/profile_images/1687827524212932608/4YbxdPVx_400x400.jpg' />
            </AvatarGroup>
            <Text fontSize={"md"}>Join a community of 200+ creators and kickstart your Notion blog today!</Text>
        </Box>
    )
}

export default JoinOthers