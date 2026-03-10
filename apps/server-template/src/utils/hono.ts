import z from "zod";

export function honoDescribeRoute(tag: string, responseZod?: z.ZodSchema) {
  // const requestSchema = requestZod
  //   ? (z.toJSONSchema(requestZod, {
  //       target: "openapi-3.0",
  //     }) as any)
  //   : {};
  const responseSchema = responseZod ? (z.toJSONSchema(responseZod) as any) : {};

  return {
    tags: [tag],
    // requestBody: {
    //   content: {
    //     "application/json": {
    //       schema: requestSchema,
    //     },
    //   },
    // },
    responses: {
      200: {
        description: "",
        content: {
          "text/plain": { schema: responseSchema },
        },
      },
    },
  };
}
