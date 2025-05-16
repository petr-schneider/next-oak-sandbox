"use client";

import { trpc } from "@/utils/trpc";
import { Trash } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, FieldErrors, FieldValues } from "react-hook-form";
import { signIn, signOut, useSession } from "next-auth/react";

import { TRPCError } from "@trpc/server";

type TRPCErrorWithMessage = {
  message: string;
};

export default function PostsPage() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState(""); // For controlling textarea

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  const limit = 2;
  const { data, fetchNextPage, refetch, hasNextPage, isFetching } =
    trpc.post.getAllWithUser.useInfiniteQuery(
      {
        limit,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Define the mutation for creating a new post
  const { mutateAsync: createPost } = trpc.post.createPost.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllWithUser"]);
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      // TODO Handle error (e.g., show a notification)
    },
  });

  // TODO MACI: PROC SE MI ZDA, ze prestane invaldiate fungovat po delsi pauze
  // TODO MACI: HOW TO INVALIDATE
  // TODO MACI: HOW TO  catch
  const { mutateAsync: deletePost } = trpc.post.deleteById.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["getAllWithUser"]);
      console.log("Post deleted successfully");
    },
    onError: (error: TRPCErrorWithMessage) => {
      console.log("Full error:", error);
      if (error.message) {
        console.error("Error:", error.message);
        // Handle the message logic as needed
      }
    },
  });

  const onSubmit = async (data: FieldValues) => {
    console.log("Form Submitted:", data); // Here you will get the form data
    await createPost({ title: "New Post", text: data.message });
    setMessage("");
  };

  return (
    <div className="">
{/*       <div>
        <h1>Dashboard</h1>
        {session?.user ? (
          <>
            <p>Welcome, {session.user.name}</p>
            <button onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </div> */}

      <div className="flex bg-gray-100">
        {/* Main Content - Cards Feed (Centered) */}
        <div className="flex-1 flex justify-center items-center px-4 sm:px-6 lg:px-8">
          {/* Card container with max width */}
          <div className="w-full max-w-xl p-6 space-y-4">
            {/* Textarea and Send Button */}
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-4 rounded-lg shadow-md space-y-4"
              >
                <textarea
                  {...register("message", {
                    required: "Message is required",
                    minLength: {
                      value: 5,
                      message: "Message must be at least 5 characters long",
                    },
                  })}
                  placeholder="Write your message here..."
                  rows={4}
                  className="w-full p-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.message &&
                  typeof errors.message.message === "string" && (
                    <p className="text-red-500 text-sm">
                      {errors.message.message}{" "}
                      {/* Accessing the 'message' property */}
                    </p>
                  )}
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            </div>

            <div className="grid gap-4">
              {/* Example Cards */}
              {posts?.map((post) => (
                <div
                  key={post.id}
                  className=" bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{post.title}</h3>
                    <p className="text-sm text-gray-600">{post.text}</p>
                    {post.user ? (
                      <p className="text-sm text-gray-400">{post.user.name}</p>
                    ) : (
                      <p className="text-sm text-gray-400">Anonymous</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetching}
              >
                {isFetching ? "Loading..." : "Load More"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
