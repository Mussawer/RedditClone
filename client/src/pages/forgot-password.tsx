import { Flex, Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import Link from "next/link";
import router from "next/router";
import React, { FC, useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlCLient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import login from "./login";

const ForgotPassword: FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant={"small"}>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword({ email: values.email });
          setComplete(true);
        }}
      >
        {({ values, handleChange, isSubmitting }) =>
          complete ? (
            <Box>if an account with that email exists, we sent you can email</Box>
          ) : (
            <Form>
              <InputField name="email" label="Email" placeholder="Email" value={values.email} />
              <Button mt={4} type="submit" isLoading={isSubmitting} colorScheme="teal">
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlCLient)(ForgotPassword);
