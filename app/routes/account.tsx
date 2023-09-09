import {
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Input,
  Stack,
  Text,
  Link,
  Badge,
  Icon,
  Wrap,
  WrapItem,
  Tag,
  Tooltip,
  ButtonGroup,
} from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import {
  FiCopy,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";
import { HttpMethod } from "~/lib/@types/http";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { signInWithNotion } from "~/lib/storage/supabase.client";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { subdomainCheck, tidyName } from "~/lib/utils/domainFunctions";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await oAuthStrategy.checkSession(request, {
    failureRedirect: "/",
  });

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const pageConnected = url.searchParams.get("pageConnected");
  const prompt = url.searchParams.get("prompt");

  if (token || pageConnected) {

    const queryString = `userId=${session?.user?.id}&token=${token}&pageConnected=${pageConnected}`

    const url =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://www.blotion.com";
    try {
      await fetch(`${url}/api/generate-site?${queryString}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  // if you come to /account page just get userdata and sites
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("*, sites(*)")
    .eq("id", session.user?.id)
    .order("created_at", { foreignTable: "sites", ascending: true })
    .single();

  if (prompt) {
    return json({ userData, prompt });
  }

  return json({ userData });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await oAuthStrategy.checkSession(request, {
    failureRedirect: "/",
  });

  const formData = await request.formData();
  const action = formData.get("action");
  const page = formData.get("page");

  // Get user data - revert back to working
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("plan")
    .eq("id", session.user?.id)
    .single();

  //if user is on free plan, they can only have one published page
  if (userData.plan === "free" || userData.plan === "creative") {
    const { data: pages } = await supabaseAdmin
      .from("sites")
      .select("published", { count: "exact" })
      .eq("published", true)
      .eq("owner", session.user?.id);

    if (!pages) {
      return json({ error: "cant find pages" });
    }

    if (pages.length < 1) {
      if (action === "pub") {
        const { data } = await supabaseAdmin
          .from("sites")
          .update({ published: true })
          .eq("id", page)
          .eq("owner", session.user?.id);

        if (data) {
          return json({ status: "success page published" });
        }
      }
    }

    if (pages.length == 1) {
      if (action === "unpub") {
        const { data } = await supabaseAdmin
          .from("sites")
          .update({ published: false })
          .eq("id", page)
          .eq("owner", session.user?.id);

        if (data) {
          return json({ status: "success page unpublished" });
        }
      }
      return json({
        error: "You have reached the maximum number of pages you can publish.",
      });
    }
  }

  //If user is on pro plan, they can publish 50 pages.
  if (userData.plan === "pro") {
    const { data: pages } = await supabaseAdmin
      .from("sites")
      .select("published", { count: "exact" })
      .eq("published", true)
      .eq("owner", session.user?.id);

    if (!pages) {
      return json({ error: "cant find pages" });
    }

    if (action === "pub") {
      if (pages.length < 50) {
        const { data } = await supabaseAdmin
          .from("sites")
          .update({ published: true })
          .eq("id", page)
          .eq("owner", session.user?.id);

        if (data) {
          return json({ status: "success page published" });
        }
      }
      return json({
        error: "You have reached the maximum number of pages you can publish.",
      });
    }

    if (action === "unpub") {
      const { data } = await supabaseAdmin
        .from("sites")
        .update({ published: false })
        .eq("id", page)
        .eq("owner", session.user?.id);

      if (data) {
        return json({ status: "success page unpublished" });
      }
    }

    return json({
      status: "error",
      message: "You are not authorized to create pages",
    });
  }
};

export default function Account() {
  const { userData } = useLoaderData();
  const [data, setData] = useState(userData);

  useEffect(() => setData(userData), [userData]);

  const fetcher = useFetcher();
  const intervalTimer = userData?.sites ? 30 : 5;

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetcher.load("/account");
      }
    }, intervalTimer * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);

  const actionData = useActionData();
  const transition = useTransition();
  const nav = useNavigate();
  const [hover, setHover] = useState("");

  const pagePublishLimit =
    userData.plan === "free" || userData.plan === "creative" ? 1 : 10;
  const pagesPublished = userData.sites.filter(
    (page: { published: any }) => page.published
  ).length;

  const message = actionData
    ? actionData.encrypted
      ? actionData.encrypted
      : actionData.decrypted
    : "";
  const isSubmitting = transition.state === "submitting";
  const canManagePlan = userData.plan === "creative" || userData.plan === "pro";
  const canPurchase = userData.plan === "free";

  const redirectURL = canManagePlan
    ? "/api/create-customer-portal-session"
    : "/pricing";

  return (
    <>
      <Box
        bg={"box"}
        width={"full"}
        mt={{ base: 2, md: 10 }}
        p={{ base: 2, md: 10 }}
        rounded={"lg"}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          width={"100%"}
          justify={"space-between"}
          gap={2}
        >
          <Flex
            gap={4}
            bg={"gray.100"}
            rounded={"md"}
            p={5}
            align={"center"}
            justify={"space-between"}
            direction={{ base: "column", md: "row" }}
            width={"full"}
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              justify={"space-between"}
              w={"full"}
              align={"center"}
            >
              <Flex gap={3}>
                <Avatar
                  name={userData.name ? userData.name : userData.email}
                  src={userData.avatar_url}
                ></Avatar>
                <Flex direction={"column"}>
                  <Flex gap={2} align={"center"}>
                    <Text>{userData.name}</Text>
                    <Badge
                      minW={"50px"}
                      maxWidth={"70px"}
                      h={"20px"}
                      variant={"subtle"}
                      colorScheme={"purple"}
                      textAlign={"center"}
                      width={"50%"}
                    >
                      {userData.plan}
                    </Badge>
                  </Flex>
                  <Text>{userData.email}</Text>
                </Flex>
              </Flex>
              <Flex
                align={"center"}
                mt={{ base: 5, md: 0 }}
                gap={2}
                direction={{ base: "row", md: "row" }}
              >
                <Form
                  method={canManagePlan ? "post" : "get"}
                  action={redirectURL}
                >
                  <Button
                    size={"sm"}
                    minW={"100px"}
                    colorScheme={"blue"}
                    variant={"outline"}
                    type={"submit"}
                  >
                    {canManagePlan ? "Manage Plan" : "Upgrade"}
                  </Button>
                </Form>
                <Form method={"post"} action={"/auth/logout"}>
                  <Button
                    size={"sm"}
                    minW={"100px"}
                    colorScheme={"gray"}
                    variant={"outline"}
                    type={"submit"}
                  >
                    Logout
                  </Button>
                </Form>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        <Flex mt={5} direction={"column"}>
          <Flex justify={"flex-start"} width={"100%"} gap={2}>
            <Flex
              width={{ base: "full", md: "85%" }}
              justify={"flex-start"}
              bg={"gray.100"}
              rounded={"md"}
              pb={1}
              pt={1}
              align={"center"}
              gap={4}
            >
              <Tag
                colorScheme={pagesPublished < 1 ? "red" : "green"}
                h={5}
                ml={3}
              >
                Sites Live {pagesPublished}
              </Tag>
            </Flex>
            <Flex>
              <ButtonGroup>
                <Button rounded={"md"} onClick={() => signInWithNotion()}>
                  <Icon as={FiPlus} mr={{ base: 0, md: 2 }} />
                  <Text display={{ base: "none", md: "flex" }}>
                    Connect New Page
                  </Text>
                </Button>
                <Tooltip
                  placement="top"
                  hasArrow
                  label="Sync with Notion Workspace"
                  shouldWrapChildren
                >
                  <Button
                    rounded={"md"}
                    onClick={() => nav(`/account?pageConnected=true`)}
                  >
                    <Icon as={FiRefreshCw} />
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </Flex>
          </Flex>
          <Flex
            justify={"center"}
            mt={4}
            display={userData && userData.sites.length < 1 ? "flex" : "none"}
            direction={"column"}
            gap={2}
            align={"center"}
          >
            <Text>
              Need help getting started?{" "}
              <Link
                href={"https://guide.blotion.com"}
                isExternal
                fontWeight={"normal"}
                textDecoration={"underline"}
              >
                Check the guide
              </Link>
            </Text>
            <Text>
              Site not appearing yet?{" "}
              <Link
                as={RemixLink}
                to={"/account"}
                fontWeight={"bold"}
                textDecoration={"underline"}
              >
                Try Refreshing
              </Link>
            </Text>
          </Flex>
          <Wrap mt={5} justify={"space-between"}>
            {userData.sites.map((page: any) => (
              <WrapItem key={page.id} maxWidth={{ base: "full", md: "49%" }}>
                <Box
                  position={"relative"}
                  border={"1px"}
                  borderColor={"gray.300"}
                  rounded={"lg"}
                  p={4}
                  maxH={{ base: "full", md: 250 }}
                  cursor={"pointer"}
                  onClick={() => setHover(page.id)}
                  onMouseEnter={() => setHover(page.id)}
                  onMouseLeave={() => setHover("")}
                >
                  <Flex
                    justify={"flex-end"}
                    display={page.published ? "flex" : "none"}
                  >
                    <Tag
                      colorScheme={"green"}
                      position={"absolute"}
                      top={"2%"}
                      right={"2%"}
                      zIndex={100}
                    >
                      {page.published ? "Live" : null}
                    </Tag>
                  </Flex>
                  {hover == page.id ? (
                    <Stack
                      direction={{ base: "row", md: "column" }}
                      position={"absolute"}
                      top={"45%"}
                      left={"50%"}
                      transform={"translate(-50%, -50%)"}
                      zIndex={100}
                    >
                      <Button
                        size={"sm"}
                        colorScheme={"blue"}
                        onClick={() => nav(`/settings/${page.id}`)}
                      >
                        Settings
                      </Button>
                      <Button
                        size={"sm"}
                        colorScheme={"purple"}
                        onClick={() => nav(`/metrics/${page.id}`)}
                        isDisabled={userData.plan === "free"}
                      >
                        Metrics
                      </Button>
                      <Form method="post">
                        <Input
                          hidden
                          name="page"
                          value={page.id}
                          readOnly
                        ></Input>
                        <Tooltip
                          display={
                            page.published || pagesPublished < pagePublishLimit
                              ? "none"
                              : "flex"
                          }
                          placement="top"
                          hasArrow
                          label="Upgrade to Pro to publish more pages"
                          shouldWrapChildren
                          mb="3"
                        >
                          <Button
                            size={"sm"}
                            type={"submit"}
                            name="action"
                            isLoading={isSubmitting}
                            isDisabled={
                              page.published == false &&
                              pagesPublished >= pagePublishLimit
                            }
                            value={page.published ? "unpub" : "pub"}
                            colorScheme={page.published ? "orange" : "green"}
                          >
                            {page.published ? "Unpublish" : "Publish"}
                          </Button>
                        </Tooltip>
                      </Form>
                    </Stack>
                  ) : null}
                  <Stack>
                    <Stack opacity={hover == page.id ? "50%" : "100%"}>
                      <Box
                        rounded={"md"}
                        overflow={"hidden"}
                        maxH={{ base: "250px", md: "180px" }}
                      >
                        <Image
                          minH={"200px"}
                          objectFit={"cover"}
                          src={
                            page.cover
                              ? page.cover
                              : "https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=848&q=80"
                          }
                        />
                      </Box>
                    </Stack>
                    <Flex
                      justify={"center"}
                      bg={"gray.200"}
                      rounded={"md"}
                      pb={1}
                      pt={1}
                    >
                      <Link
                        href={
                          page.published
                            ? `https://${page.site_name}.blotion.com`
                            : `https://${page.site_name}.blotion.com?preview=${page.owner}`
                        }
                        isExternal
                      >
                        <Text key={page.id}>
                          https://{page.site_name}.blotion.com
                        </Text>
                      </Link>
                    </Flex>
                  </Stack>
                </Box>
              </WrapItem>
            ))}
          </Wrap>
        </Flex>
      </Box>
      <Flex mt={5} justify={"center"}>
        <Flex direction={"column"} align={"center"}>
          <Button
            minW={200}
            mb={4}
            as={Link}
            href={
              "https://blotion-site.notion.site/Guide-949edbf9fc504b868ca3e701cf233655"
            }
            isExternal
            target={"_blank"}
          >
            <Icon as={FiCopy} fontSize="xl" mr={2}></Icon>
            Copy Notion Template
          </Button>
          <Text>Having issues, or need help with your account? </Text>
          <Text>
            Get in touch{" "}
            <Link href="mailto:support@blotion.com" fontWeight={"bold"}>
              support@blotion.com
            </Link>
          </Text>
        </Flex>
      </Flex>
    </>
  );
}