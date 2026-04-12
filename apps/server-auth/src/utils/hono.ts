import z from "zod";

interface HonoDescribeRouteOptions {
  tag?: string;
  summary?: string;
  responseZod?: z.ZodSchema;
  bodyZod?: z.ZodSchema;
  queryZod?: z.ZodSchema;
  paramZod?: z.ZodSchema;
}

export function honoDescribeRoute(options: HonoDescribeRouteOptions) {
  const { tag, summary, responseZod, bodyZod, queryZod, paramZod } = options;

  const responseSchema = responseZod
    ? (z.toJSONSchema(responseZod, { target: "openapi-3.0" }) as Record<string, unknown>)
    : {};

  const result: Record<string, unknown> = {
    ...(tag ? { tags: [tag] } : {}),
    ...(summary ? { summary } : {}),
    responses: {
      200: {
        description: summary ?? "",
        content: {
          "application/json": { schema: responseSchema },
        },
      },
    },
  };

  if (bodyZod) {
    result.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: z.toJSONSchema(bodyZod, { target: "openapi-3.0" }) as Record<string, unknown>,
        },
      },
    };
  }

  if (queryZod) {
    const queryJsonSchema = z.toJSONSchema(queryZod, { target: "openapi-3.0" }) as Record<string, unknown>;
    const properties = (queryJsonSchema.properties ?? {}) as Record<string, unknown>;
    const required = (queryJsonSchema.required ?? []) as string[];

    result.parameters = Object.entries(properties).map(([name, schema]) => ({
      name,
      in: "query",
      required: required.includes(name),
      schema,
    }));
  }

  if (paramZod) {
    const paramJsonSchema = z.toJSONSchema(paramZod, { target: "openapi-3.0" }) as Record<string, unknown>;
    const properties = (paramJsonSchema.properties ?? {}) as Record<string, unknown>;
    const paramParameters = Object.entries(properties).map(([name, schema]) => ({
      name,
      in: "path",
      required: true,
      schema,
    }));

    result.parameters = [
      ...((result.parameters as Array<Record<string, unknown>> | undefined) ?? []),
      ...paramParameters,
    ];
  }

  return result;
}
