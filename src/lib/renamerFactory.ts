export const renamerFactory = function (renamingMapping = {}) {
  const renamerFn = function (result) {
    let newResult = {};

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
