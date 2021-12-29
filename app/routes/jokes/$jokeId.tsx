import { Link, useLoaderData, useParams } from 'remix';
import { z } from 'zod';
import type { LoaderFunction } from 'remix';

import { db } from '~/utils/db.server';
import type { Joke } from '@prisma/client';

type LoaderData = { joke: Pick<Joke, 'content' | 'name'> | null };

const LoaderDataSchema = z.object({
  joke: z.object({
    content: z.string(),
    name: z.string(),
  }),
});

export const loader: LoaderFunction = async ({ params }) => {
  const joke = await db.joke.findUnique({
    select: { content: true, name: true },
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
      <Link to=".">{data.joke?.name} Permalink</Link>
    </div>
  );
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
