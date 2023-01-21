import React, { FC } from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useRegisterUserMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlCLient } from "../utils/createUrqlClient";



interface registerProps {}

const Register: FC<registerProps> = ({}) => {
  const router = useRouter()
  const [data,register] = useRegisterUserMutation()
  return (
    <Wrapper variant={"small"}>
      <Formik
        initialValues={{username: "", password: "", email: "" }}
        onSubmit={async (values, {setErrors}) => {
          const options = {options:{...values}}
          const response = await register(options)
          if(response.data?.register.errors){
            setErrors(toErrorMap(response.data?.register.errors))
          }
          else if(response.data?.register.user){
            router.push("/")
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <InputField name="username" label="Username" placeholder="Username" value={values.username} />
            <Box mt={4}>
              <InputField name="email" label="Email" placeholder="Email" value={values.email} />
            </Box>
            <Box mt={4}>
              <InputField name="password" label="Password" placeholder="Password" value={values.password} type={"password"} />
            </Box>
            <Button mt={4} colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlCLient)(Register);
