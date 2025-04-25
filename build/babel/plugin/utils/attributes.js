function addClass(babelT, name_index, className) {
    const classResult = babelT.expressionStatement(
        babelT.callExpression(
            babelT.memberExpression(babelT.identifier(name_index), babelT.identifier("setAttribute")),
            [babelT.stringLiteral("class"), babelT.stringLiteral(className)]
        )
    )
    return classResult;
}

function addEvent(babelT, name_index, eventName, eventFunction) {
    let eventResult = null
    if (typeof eventFunction === "string") {
        eventResult=    babelT.expressionStatement(
            // 绑定onClick事件
            babelT.assignmentExpression(
                "=",
                babelT.memberExpression(babelT.identifier(name_index), babelT.identifier(eventName.toLowerCase())),
                babelT.identifier(eventFunction)
            )
        )
    }
    else{
        eventResult= babelT.expressionStatement(
            babelT.assignmentExpression(
                "=",
                babelT.memberExpression(babelT.identifier(name_index), babelT.identifier(eventName.toLowerCase())),
                eventFunction
            )
        )
    }
    return eventResult;
}

function addNormalAttribute(babelT, name_index, attributeName, attributeValue){
    const attributeResult = babelT.expressionStatement(
        babelT.callExpression(
            babelT.memberExpression(babelT.identifier(name_index), babelT.identifier("setAttribute")),
            [babelT.stringLiteral(attributeName), babelT.stringLiteral(attributeValue)]
        )
    )
    return attributeResult;
}

function addNormalAttribute_1(babelT, name_index, attributeName, attributeValue){
  const attrResult=  babelT.expressionStatement(
        babelT.assignmentExpression(
            '=',
            babelT.memberExpression(
                babelT.identifier(name_index),
                babelT.identifier(attributeName)
            ),
            babelT.identifier(attributeValue)
        )
    )
    return attrResult;
}
module.exports = {
    addClass,
    addEvent,
    addNormalAttribute,
    addNormalAttribute_1
}