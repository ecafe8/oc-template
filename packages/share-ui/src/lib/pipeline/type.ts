export interface ExecutePipelineParams {
  input: unknown;
  pipeline: ((value: unknown) => unknown | Promise<unknown>)[];
}
