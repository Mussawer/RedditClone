import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { useGetAllPostsQuery } from "../generated/graphql";
import { createUrqlCLient } from "../utils/createUrqlClient";
import { useState } from "react";
import VoteSection from "../components/VoteSection";
import NextLink from "next/link";
import EditDeletePostButtons from "../components/EditDeletePostButtons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const { data, error, loading } = useGetAllPostsQuery({
    variables,
  });
  console.log("🚀 ~ file: index.tsx:19 ~ Index ~ error", error)
  console.log("🚀 ~ file: index.tsx:15 ~ Index ~ data", data);
  return (
    <Layout>
      {!data && loading ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data?.posts.posts.map((p) => !p ? null : (
            <Flex key={p._id} p={5} shadow="md" borderWidth="1px">
              <VoteSection post={p} />
              <Box flex={1}>
                <Link as={NextLink} href={`/post/${p._id}`}>
                  <Heading fontSize="xl">{p.title}</Heading>
                </Link>
                <Text>posted by {p?.creator?.username}</Text>
                <Flex>
                  <Text mt={4}>{p.textSnippet}</Text>
                  <Box ml="auto">
                      <EditDeletePostButtons
                        _id={p._id}
                        creatorId={p?.creator?._id}
                      />
                    </Box>
                </Flex>
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
            isLoading={loading}
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
// export default withUrqlClient(createUrqlCLient, { ssr: true })(Index);

//with apollo client
export default Index;
