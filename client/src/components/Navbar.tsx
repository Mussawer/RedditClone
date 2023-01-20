import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React, { FC } from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
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
      <Box>
        <Box>{data.me.username}</Box>
        <Button>logout</Button>
      </Box>
    );
  }
  return (
    <Flex bg="teal" padding={4}>
      <Box marginLeft={"auto"}>{body}</Box>
    </Flex>
  );
};

export default Navbar;
