// eslint-disable-next-line no-unused-vars
export const assertUnreachable = (_x: never): never => {
  throw new Error("Didn't expect to get here");
};

export const assertUnreachableOrReturnDefault = <DefaultValue>(
  unreachableValue: never,
  defaultValue: DefaultValue,
): DefaultValue => {
  if (process.env.NODE_ENV !== 'production') {
    assertUnreachable(unreachableValue);
  }
  return defaultValue;
};
