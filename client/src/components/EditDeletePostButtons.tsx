import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Box } from "@chakra-ui/react";
import React, { FC } from "react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  _id?: number;
  creatorId: number;
}

const EditDeletePostButtons: FC<EditDeletePostButtonsProps> = ({ _id, creatorId }) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();

  if (meData?.me?._id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${_id}`}>
        <IconButton mr={4} icon={<EditIcon />} aria-label="Edit Post" colorScheme={"green"} />
      </NextLink>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="Delete Post"
        onClick={() => {
          deletePost({ _id: _id as number });
        }}
        colorScheme={"red"}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
