import { transformFileAsync } from "@babel/core";

const DECORATOR_IMPORTS_NAME = "ClassImplements";
const DECORATOR_SOURCE_PATH = "@sweet-monads/interfaces";

function eliminateAllStaticClassImplementsCheck(filepath) {
  return transformFileAsync(filepath, {
    plugins: [staticClassImplementsEliminator],
  });
}

function staticClassImplementsEliminator() {
  return {
    visitor: {
      ImportSpecifier(path, state) {
        if (!state.opts.isInsideInterfaces) {
          return;
        }
        if (path.node.imported.name === DECORATOR_IMPORTS_NAME) {
          state.opts.decoratorLocalName = path.node.local.name;
          path.remove();
          state.opts.isChanged = true;
        }
      },
      ImportDeclaration: {
        enter(path, state) {
          if (path.node.source.value !== DECORATOR_SOURCE_PATH) {
            return;
          }
          state.opts.isInsideInterfaces = true;
        },
        exit(path, state) {
          if (path.node.source.value !== DECORATOR_SOURCE_PATH) {
            return;
          }
          if (state.opts.isChanged && path.node.specifiers.length === 0) {
            path.remove();
          }
          state.opts.isInsideInterfaces = false;
          state.opts.isChanged = false;
        },
      },
      Decorator(path, state) {
        const name = state.opts.decoratorLocalName;
        if (name === undefined) return;
        if (path.node.expression?.callee?.name !== name) return;
        path.remove();
      }
    },
  };
}
