import { parse, types, print } from 'recast'

const { variableDeclaration, variableDeclarator, functionExpression } = types.builders
export const ast = () => {
  const code = `
  function add(a, b) {
    return a +
      // 有什么奇怪的东西混进来了
      b
  }
  `
  const astTree = parse(code)
  let add = astTree.program.body[0]
  astTree.program.body[0] = variableDeclaration('const', [
    variableDeclarator(add.id, functionExpression(
      null,
      add.params,
      add.body
    ))
  ])
  const output = print(astTree).code
  console.log(output)

}
