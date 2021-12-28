import { redirect, useActionData, json } from 'remix';
import type { ActionFunction } from 'remix';
import { db } from '~/utils/db.server';

function validateJokeName(name: string): string | undefined {
  if (name.length < 3) {
    return 'Joke name must be at least 3 characters long';
  }
}

function validateJokeContent(content: string): string | undefined {
  if (content.length < 10) {
    return 'Joke content must be at least 10 characters long';
  }
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const form = await request.formData();
  const name = form.get('name');
  const content = form.get('content');

  if (typeof name !== 'string' || typeof content !== 'string') {
    return badRequest({ formError: 'Form not submitted correctly.' });
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields: { name, content } });
  }

  const joke = await db.joke.create({
    data: { name, content },
  });

  return redirect(`/jokes/${joke.id}`);
};

export default function New() {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-describedby={
                actionData?.fieldErrors?.name ? 'name-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content ? 'content-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
