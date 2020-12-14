export const renamerFactory = function <T>(renamingMapping: T) {
  const renamerFn = function (result): T {
    let newResult = {} as T;

    for (const key in result) {
      if (renamingMapping[key]) {
        newResult[renamingMapping[key]] = result[key];
      } else {
        newResult[key] = result[key];
      }
    }
    return newResult;
  };

  return renamerFn;
};
