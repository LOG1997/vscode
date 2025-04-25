function createElement(babelT, elementName, name_index) {
    const createElementCall = babelT.callExpression(
        babelT.memberExpression(babelT.identifier("document"), babelT.identifier("createElement")),
        [babelT.stringLiteral(elementName)]
    );
    // 创建 element 变量声明
    const elementDeclaration = babelT.variableDeclaration("const", [
        babelT.variableDeclarator(babelT.identifier(name_index), createElementCall)
    ]);
    return elementDeclaration;
}

function appendElement(babelT, name_index, child_element) {
    const appendElementDeclaration = babelT.expressionStatement(
        babelT.callExpression(
            babelT.memberExpression(babelT.identifier(name_index), babelT.identifier("append")),
            [babelT.identifier(child_element)]
        )
    )
    return appendElementDeclaration;
}

function appendText(babelT, name_index, text) {
    const appendTextDeclaration = babelT.expressionStatement(
        babelT.callExpression(
            babelT.memberExpression(babelT.identifier(name_index), babelT.identifier("append")),
            [babelT.stringLiteral(text)]
        )
    )
    return appendTextDeclaration;
}

function appendVariable(babelT, name_index, variable) {
    const appendVariableDeclaration = babelT.expressionStatement(
        babelT.callExpression(
            babelT.memberExpression(babelT.identifier(name_index), babelT.identifier("append")),
            [variable]
        )
    )
    return appendVariableDeclaration;
}

module.exports = { createElement,appendElement, appendText,appendVariable };