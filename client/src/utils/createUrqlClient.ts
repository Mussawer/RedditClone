import { createClient, dedupExchange, Exchange, fetchExchange, Provider, ssrExchange } from "urql";
import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
import {
  CreatePostMutation,
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterUserMutation,
  VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";
import gql from "graphql-tag";
import { isServer } from "./isServer";

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      })
    );
  };

const cursorPagination = (): Resolver => {
  return (_parent, args, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldsInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldsInfos.length;
    if (size === 0) {
      return undefined;
    }

    const isInCache = cache.resolve({ __typename: entityKey }, fieldName, args);
    info.partial = !isInCache;

    let hasMore = true;
    const results: string[] = [];
    fieldsInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

function invalidateAllPosts(cache: Cache) {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || {});
  });
}

export const createUrqlCLient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        //updates the urql cache whenever login and register runs
        updates: {
          Mutation: {
            deltePost: (result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                _id: (args as DeletePostMutationVariables)._id,
              });
            },
            vote: (result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    _id
                    points
                    voteStatus
                  }
                `,
                { _id: postId } as any
              );

              if (data) {
                if (data) {
                  if (data.voteStatus === value) {
                    return;
                  }
                  const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                  cache.writeFragment(
                    gql`
                      fragment __ on Post {
                        points
                        voteStatus
                      }
                    `,
                    { _id: postId, points: newPoints, voteStatus: value } as any
                  );
                }
              }
            },

            //adding a post in db
            //on client side removing the data from cache
            //and reload the data
            createPost: (_result, args, cache, info) => {
              invalidateAllPosts(cache);
            },
            logout: (_result, args, cache, info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, args, cache, info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query;
                  } else {
                    return {
                      me: result.login.user,
                    };
                  }
                }
              );
              invalidateAllPosts(cache)
            },
            register: (_result, args, cache, info) => {
              betterUpdateQuery<RegisterUserMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query;
                  } else {
                    return {
                      me: result.register.user,
                    };
                  }
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
