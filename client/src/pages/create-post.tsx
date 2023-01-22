import { Button, Box, useFocusEffect } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { FC, useEffect } from "react";
import { InputField } from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { createUrqlCLient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: FC<{}> = ({}) => {
  const router = useRouter();
  useIsAuth()
  const [, createPost] = useCreatePostMutation();
  return (
    <Layout variant={"small"}>
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ options: values });
          if (!error) {
            router.push("/");
          }
        }}
      >
        {({ values, isSubmitting }) => (
          <Form>
            <InputField name="title" label="title" placeholder="title" value={values.title} />
            <Box mt={4}>
              <InputField textarea name="text" placeholder="text..." label="Body" />
            </Box>
            <Button mt={4} colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlCLient)(CreatePost);
