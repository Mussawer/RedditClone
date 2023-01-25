import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { FC, useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface VoteSectionsProps {
  post: PostSnippetFragment;
}

const VoteSection: FC<VoteSectionsProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction={"column"} justifyContent={"center"} alignItems={"center"} marginRight={4}>
      <IconButton
        aria-label={"upvote post"}
        icon={<ChevronUpIcon />}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("upvote-loading");
          await vote({
            postId: post._id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "upvote-loading"}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
      />
      {post.points}
      <IconButton
        aria-label={"downvote post"}
        icon={<ChevronDownIcon />}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downvote-loading");
          await vote({
            postId: post._id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downvote-loading"}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
      />
    </Flex>
  );
};

export default VoteSection;
