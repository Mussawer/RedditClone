import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../entities/User";


export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findBy({ _id: In(userIds) });
    const userIdToUser: Record<number, User> = {};
    users.forEach((user) => {
      userIdToUser[user._id] = user;
    });

    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
   
    return sortedUsers;
  });
