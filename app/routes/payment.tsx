import { Center, Flex, Heading, Spinner } from "@chakra-ui/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const statusSuccess = url.searchParams.get("success");
  const statusCanceled = url.searchParams.get("canceled");

  if (statusSuccess) {
    return json({ status: "success" });
  }

  if (statusCanceled) {
    return redirect(`/pricing`);
  }

  return json({ status: "error" });
};

export default function Payment() {
  const [status, setStatus] = useState("Loading...");

  const nav = useNavigate();

  useEffect(() => {
    //wait 3 seconds then run a function
    setTimeout(() => {
      setStatus("Setting up your Upgraded Account");
    }, 1000);

    setTimeout(() => {
      setStatus("Almost there...");
    }, 3000);

    setTimeout(() => {
      setStatus("Your Account is ready!");
    }, 7000);

    setTimeout(() => {
      nav("/account");
    }, 9000);
  }, []);

  return (
    <Center h={"55vh"}>
      <Flex flexDirection={"column"} align="center" width={"full"} h={400}>
        <Spinner size={"lg"} />
        <Heading mt={5}>{status}</Heading>
        <Flex
          mt={2}
          display={status === "Your Account is ready!" ? "flex" : "none"}
        >
          <Link to={"/account"}>
            Click here if you are not redirected to your account page.
          </Link>
        </Flex>
      </Flex>
    </Center>
  );
}
