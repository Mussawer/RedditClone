import DataLoader from "dataloader";
import { Vote } from "../entities/Vote";


export const createVoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Vote | null>(async (keys) => {
    const votes = await Vote.find({ where: [keys as any] });
    const voteIdtoUpdate: Record<string, Vote> = {};
    votes.forEach((vote) => {
        voteIdtoUpdate[`${vote.userId}|${vote.postId}`] = vote;
    });

    return keys.map(
        (key) => voteIdtoUpdate[`${key.userId}|${key.postId}`]
      );
  });
