import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React, { FC } from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import {useRouter} from 'next/router'

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let body = null;
  //data is loading
  if (loading) {
  }
  //user not found
  else if (!data?.me) {
    body = (
      <>
        <Link as={NextLink} href="/login" color={"white"} marginRight={2}>
          Login
        </Link>
        <Link as={NextLink} color={"white"} href="/register">
          Register
        </Link>
      </>
    );
  }
  //user is logged in
  else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button variant="link" mr={4} color={"white"}>
            create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout({});
            router.reload();
          }}
          isLoading={logoutFetching}
          variant="link"
          color={"white"}
        >
          logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex zIndex={1} position="sticky" top={0} bg="teal" p={4}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <Link as={NextLink} href="/">
          <Heading>Reddit Clone</Heading>
        </Link>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default Navbar;
