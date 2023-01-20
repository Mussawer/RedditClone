import React, { FC } from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/wrapper";
import { InputField } from "../components/inputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";



interface loginProps {}

const Login: FC<loginProps> = ({}) => {
  const router = useRouter()
  const [data,login] = useLoginMutation()
  return (
    <Wrapper variant={"small"}>
      <Formik
        initialValues={{username: "", password: "" }}
        onSubmit={async (values, {setErrors}) => {
          const options = {options:{...values}}
          const response = await login(options)
          if(response.data?.login.errors){
            setErrors(toErrorMap(response.data?.login.errors))
          }
          else if(response.data?.login.user){
            router.push("/")
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <InputField name="username" label="Username" placeholder="Username" value={values.username} />
            {/* <Box mt={4}>
              <InputField name="email" label="Email" placeholder="Email" value={values.email} />
            </Box> */}
            <Box mt={4}>
              <InputField name="password" label="Password" placeholder="Password" value={values.password} type={"password"} />
            </Box>
            <Button mt={4} colorScheme="teal" type="submit" isLoading={isSubmitting}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
