import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { FC } from "react";
import { InputField } from "../../../components/InputField";
import Layout from "../../../components/Layout";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlCLient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";

const EditPost: FC<{}> = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      _id: intId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

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

  return (
    <Layout variant={"small"}>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values, { setErrors }) => {
          await updatePost({ _id: intId, ...values });
          router.back();
        }}
      >
        {({ values, isSubmitting }) => (
          <Form>
            <InputField name="title" label="title" placeholder="title" value={values.title} />
            <Box mt={4}>
              <InputField textarea name="text" placeholder="text..." label="Body" />
            </Box>
            <Button mt={4} colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Update Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlCLient)(EditPost);
