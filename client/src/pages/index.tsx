import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { useGetAllPostsQuery } from "../generated/graphql";
import { createUrqlCLient } from "../utils/createUrqlClient";
import { useState } from "react";
import VoteSection from "../components/VoteSection";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = useGetAllPostsQuery({
    variables,
  });
  console.log("🚀 ~ file: index.tsx:15 ~ Index ~ data", data);
  return (
    <Layout>
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data?.posts.posts.map((p) => (
            <Flex key={p._id} p={5} shadow="md" borderWidth="1px">
              <VoteSection post={p} />
              <Box>
                <Heading fontSize="xl">{p.title}</Heading>
                <Text>posted by {p.creator.username}</Text>
                <Text mt={4}>{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

//does not by default ssr but just sets up urql provider
//to ssr just give ssr true
export default withUrqlClient(createUrqlCLient, { ssr: true })(Index);
