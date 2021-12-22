import { Link, useLoaderData } from 'remix';
import { z } from 'zod';
import type { LoaderFunction } from 'remix';

import { db } from '~/utils/db.server';
import type { Joke } from '@prisma/client';

type LoaderData = { randomJoke: Joke };

const LoaderDataSchema = z.object({
  randomJoke: z.object({
    id: z.string(),
    content: z.string(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const loader: LoaderFunction = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  });
  const data: LoaderData = { randomJoke };
  return data;
};

export default function JokesIndexRoute() {
  const data = LoaderDataSchema.parse(useLoaderData<LoaderData>());

  return (
    <div>
      <p>Here&apos;s a random joke:</p>
      <p>{data.randomJoke.content}</p>
      <Link to={data.randomJoke.id}>
        &quot;{data.randomJoke.name}&quot; Permalink
      </Link>
    </div>
  );
}
