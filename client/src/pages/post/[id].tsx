import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { FC } from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import Layout from "../../components/Layout";
import { createUrqlCLient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post: FC<{}> = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();
  if (fetching) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }
  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box mb={4}>{data.post.text}</Box>
      <EditDeletePostButtons _id={data.post._id} creatorId={data.post.creator._id} />
    </Layout>
  );
};

export default withUrqlClient(createUrqlCLient, { ssr: true })(Post);
