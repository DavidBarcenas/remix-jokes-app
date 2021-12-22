import type { LinksFunction, LoaderFunction } from 'remix';
import type { Joke } from '@prisma/client';
import { useLoaderData } from 'remix';
import { Link } from 'remix';
import { Outlet } from 'remix';
import { z } from 'zod';
import { db } from '~/utils/db.server';
import stylesUrl from '~/styles/jokes.css';

type LoaderData = { jokeListItems: Array<Pick<Joke, 'id' | 'name'>> };

const LoaderDataSchema = z.object({
  jokeListItems: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
});

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    jokeListItems: await db.joke.findMany({
      take: 5,
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    }),
  };
  return data;
};

export default function Jokes() {
  const data = LoaderDataSchema.parse(useLoaderData<LoaderData>());

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map(j => (
                <li key={j.id}>
                  <Link to={j.id}>{j.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
