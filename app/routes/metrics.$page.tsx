import {
  Box,
  Flex,
  Image,
  Stack,
  Tag,
  Text,
  Link,
  FormLabel,
  Input,
  InputGroup,
  Button,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  Switch,
  Heading,
  Divider,
} from "@chakra-ui/react";
import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useTransition,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { useEffect, useState } from "react";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await oAuthStrategy.checkSession(request, {
    failureRedirect: "/",
  });

  const page = params.page;

  if (!page) {
    return json({
      status: "error",
      message: "No page specified",
    });
  }

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("email,plan, umami_user_id")
    .eq("id", session.user?.id)
    .single();

  const { data: siteData } = await supabaseAdmin
    .from("sites")
    .select("*")
    .eq("id", page)
    .eq("owner", session.user?.id)
    .single();

  if (!siteData) {
    return json({
      status: "error",
      message: "Page not found",
    });
  }

  return json({ siteData, userData });
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await oAuthStrategy.checkSession(request, {
    failureRedirect: "/",
  });

  const formData = await request.formData();

  return json({ status: "success" });
};

export default function Settings() {
  const { siteData: page, userData } = useLoaderData();

  const nav = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const enableMetrics = useFetcher();
  const transition = useTransition();

  console.log(enableMetrics.data);

  const isSubmitting = enableMetrics.state === "submitting";

  const handleEnable = async () => {
    const formData = new FormData();
    formData.append("siteID", page.id);
    formData.append("umami_user_id", userData.umami_user_id);
    formData.append("domain", `${page.site_name}.blotion.com`);
    enableMetrics.submit(formData, {
      method: "post",
      action: "/api/metrics/add-website",
    });
  };

  return (
    <Box
      bg={"box"}
      width={"full"}
      mt={10}
      p={{ base: 2, md: 10 }}
      rounded={"lg"}
    >
      <Flex mb={5}>
        <Button onClick={() => nav(`/account`)}>Back</Button>
      </Flex>
      <Flex>
        <Box
          position={"relative"}
          border={"1px"}
          borderColor={"gray.300"}
          rounded={"lg"}
          p={4}
          maxH={"full"}
          maxWidth={"full"}
          cursor={"pointer"}
        >
          <Flex justify={"flex-end"} display={page.published ? "flex" : "none"}>
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
          <Stack>
            <Stack>
              <Box
                rounded={"md"}
                overflow={"hidden"}
                maxH={{ base: "250px", md: "180px" }}
              >
                <Image
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
              <Link href={`https://${page.site_name}.blotion.com`} isExternal>
                <Text key={page.id}>https://{page.site_name}.blotion.com</Text>
              </Link>
            </Flex>
          </Stack>
        </Box>
      </Flex>

      {page.umami_website_id || enableMetrics.data ? null : (
        <>
          <Divider mt={5}></Divider>
          <Flex
            mt={5}
            direction={"column"}
            gap={2}
            display={
              page.umami_website_id || enableMetrics.data ? "none" : "flex"
            }
          >
            <Flex justify={"center"}>
              <Button
                colorScheme={"blue"}
                onClick={handleEnable}
                isLoading={isSubmitting}
              >
                Enable Site Metrics
              </Button>
            </Flex>
          </Flex>
          <Divider mt={5}></Divider>
        </>
      )}

      <Flex
        display={page.umami_website_id || enableMetrics.data ? "flex" : "none"}
        direction={"column"}
        align={"center"}
        gap={4}
        mt={4}
      >
        <Heading>Metrics Enabled</Heading>
        <Link href={"https://umami-one-tan.vercel.app/"} isExternal>
          <Text>Log in here umami.com</Text>
        </Link>
        <Text>Your username is {userData.email}</Text>
        <Text>
          Temporary password is <b>'admin'</b>
        </Text>
      </Flex>
    </Box>
  );
}
