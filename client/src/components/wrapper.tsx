import React from "react";
import { Box, ChakraProps } from "@chakra-ui/react";
import { PropsWithChildren } from 'react';

export type WrapperVariant = "small" | "regular";

interface WrapperProps extends ChakraProps {
  variant?: WrapperVariant;
  children?: React.ReactNode;
}

export const Wrapper: React.FC<PropsWithChildren<WrapperProps>> = ({
  children,
  variant = "regular",
  ...rest
}) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
      {...rest}
    >
      {children}
    </Box>
  );
};