import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { useGetAllPostsQuery } from "../generated/graphql";
import { createUrqlCLient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: null });
  const [{ data, fetching }] = useGetAllPostsQuery({
    variables,
  });
  return (
    <Layout>
      <NextLink href={"/create-post"}>
        <Link>Create Post</Link>
      </NextLink>
      <div>Hello</div>
      <br />

      {fetching && !data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data.posts.posts.map((p) => (
            <Box key={p._id} padding={5} shadow="md" borderWidth={1}>
              <Heading fontSize={"xl"}>{p.title}</Heading>
              <Text marginTop={4}>{p.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            // onClick={() => {
            //   fetchMore({
            //     variables: {
            //       limit: variables?.limit,
            //       cursor:
            //         data.posts.posts[data.posts.posts.length - 1].createdAt,
            //     },
            //     // updateQuery: (
            //     //   previousValue,
            //     //   { fetchMoreResult }
            //     // ): PostsQuery => {
            //     //   if (!fetchMoreResult) {
            //     //     return previousValue as PostsQuery;
            //     //   }

            //     //   return {
            //     //     __typename: "Query",
            //     //     posts: {
            //     //       __typename: "PaginatedPosts",
            //     //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
            //     //       posts: [
            //     //         ...(previousValue as PostsQuery).posts.posts,
            //     //         ...(fetchMoreResult as PostsQuery).posts.posts,
            //     //       ],
            //     //     },
            //     //   };
            //     // },
            //   });
            // }}
            // isLoading={loading}
            // m="auto"
            my={8}
            isLoading={fetching}
            m="auto"
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
