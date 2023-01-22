import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React, { FC } from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const [{fetching: logoutFetching}, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;
  //data is loading
  if (fetching) {
  }
  //user not found
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link color={"white"} marginRight={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color={"white"}>Register</Link>
        </NextLink>
      </>
    );
  }
  //user is logged in
  else {
    body = (
      <Flex>
        <Box marginRight={2}>{data.me.username}</Box>
        <Button
          variant={"link"}
          onClick={async () => {
            await logout();
          }}
          isLoading={logoutFetching}
          color={"white"}
        >
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex zIndex={1} position={'sticky'} top={0} bg="teal" padding={4}>
      <Box marginLeft={"auto"}>{body}</Box>
    </Flex>
  );
};

export default Navbar;
