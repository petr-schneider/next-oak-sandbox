// src/server/routers/postRouter.ts
import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc"; // <-- updated import
import { TRPCError } from "@trpc/server";

export const postRouter = router({
  getAll: publicProcedure.query(async ({ctx}) => {
    return await ctx.prisma.post.findMany();
  }),

  getAllWithUser: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z
          .object({
            createdAt: z.string(),
            id: z.string(),
          })
          .nullable()
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { limit, cursor } = input;

      /*       const where = nameFilter
        ? { name: { contains: nameFilter, mode: "insensitive" } }
        : {};
   */

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        cursor: cursor
          ? {
              createdAt: new Date(cursor.createdAt),
              id: cursor.id,
            }
          : undefined,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        skip: cursor ? 1 : 0,
      });

      let nextCursor: { createdAt: string; id: string } | null = null;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = {
          createdAt: nextItem!.createdAt.toISOString(),
          id: nextItem!.id,
        };
      }

      return {
        posts,
        nextCursor,
      };
    }),

  getById: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return await ctx.prisma.post.findUnique({
      where: { id: input },
    });
  }),

  deleteById: publicProcedure
    .input(z.string()) // Validate the post ID input
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user.id; // Assuming `ctx.session` has the logged-in user’s data (adjust if you're using another method for authentication)

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Fetch the post by ID
      const post = await ctx.prisma.post.findUnique({
        where: { id: input },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      // Check if the logged-in user is the owner of the post
      if (post.userId !== userId) {
        throw new Error("You can only delete your own posts");
      }

      // Proceed to delete the post if the user is the owner
      await ctx.prisma.post.delete({
        where: { id: input },
      });

      return { message: "Post deleted successfully" };
    }),

  createPost: publicProcedure
    .input(
      z.object({
        title: z.string(),
        text: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.post.create({
        data: {
          title: input.title,
          text: input.text,
          rating: 0,
        },
      });
    }),
});
