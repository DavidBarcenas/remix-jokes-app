import { z } from 'zod';
import { useLoaderData } from 'remix';
import type { LoaderFunction } from 'remix';
import type { Joke } from '@prisma/client';
import { db } from '~/utils/db.server';

type LoaderData = { joke: Pick<Joke, 'content'> | null };

const LoaderDataSchema = z.object({
  joke: z.object({
    content: z.string(),
  }),
});

export const loader: LoaderFunction = async ({ params }) => {
  const joke = await db.joke.findUnique({
    select: { content: true },
    where: { id: params.jokeId },
  });

  if (!joke) throw new Error('Joke not found');

  const data: LoaderData = { joke };
  return data;
};

export default function JokeRoute() {
  const data = LoaderDataSchema.parse(useLoaderData<LoaderData>());

  return (
    <div>
      <p>Here&apos;s your hilarious joke:</p>
      <p>{data.joke?.content}</p>
    </div>
  );
}
