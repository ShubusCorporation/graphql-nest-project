/**
 * TypeScript NodeNext resolves an import ending in `.cjs` to a source `.cts`
 * file and emits the real `.cjs` file during compilation. Jest runs from
 * source, so it needs the same fallback while resolving Prisma's client.
 */
module.exports = (request, options) => {
  try {
    return options.defaultResolver(request, options);
  } catch (error) {
    if (request.endsWith('.cjs')) {
      return options.defaultResolver(`${request.slice(0, -4)}.cts`, options);
    }

    throw error;
  }
};
