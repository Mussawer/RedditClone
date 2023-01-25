import { Box } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { FC } from "react";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlCLient } from "../../utils/createUrqlClient";

const Post: FC<{}> = ({}) => {
  const router = useRouter();
  const [{ data, error, fetching }] = usePostQuery({
    variables: {
      _id: parseInt(router.query.id),
    },
  });
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
  return <div>[id]</div>;
};

export default withUrqlClient(createUrqlCLient, { ssr: true })(Post);
