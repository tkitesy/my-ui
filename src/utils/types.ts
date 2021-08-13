export type PickKey<V, T> = {
  [k in keyof V]: V[k] extends T ? k : never;
}[keyof V];
