const { createElement, appendElement, appendText, appendVariable } = require('./utils/element')
const { addClass, addEvent, addNormalAttribute, addNormalAttribute_1 } = require('./utils/attributes')
module.exports = function (babel) {
    const { types: t } = babel;

    return {
        name: "transform-tsx-to-js",
        visitor: {
            // 删除 `import React from "react";` 语句
            ImportDeclaration(path) {
                if (
                    path.node.source.value === "react" &&
                    path.node.specifiers.length === 1 &&
                    path.node.specifiers[0].type === "ImportDefaultSpecifier" &&
                    path.node.specifiers[0].local.name === "React"
                ) {
                    path.remove(); // 删除该 import 语句
                }
            },
            // 转换 JSX 元素
            JSXElement(path) {
                let name_index = '';
                let root_element_index = Number.MAX_VALUE
                const indexArr = []
                const expressions = []
                if (path.node) {
                    const res = getOnFunction(path.node, null);
                    expressions.push(...res)
                }
                // 处理 JSX 元素的属性
                // parent指代父元素
                function getOnFunction(node, parent = null) {
                    const goExpressions = []
                    // 递归打印name和value
                    if (node.children) {
                        // getOnFunction(node.children)
                        node.children.forEach(child => {
                            const childRes = getOnFunction(child, null)
                            goExpressions.push(...childRes)
                        })
                        if (node.type == "JSXElement") {
                            const openNode = node.openingElement;
                            name_index = "element_" + openNode.start;
                            root_element_index > openNode.start ? root_element_index = openNode.start : null
                            if (!parent&&openNode.name.name) {
                                const elementDeclaration = createElement(t, openNode.name.name, name_index);
                                goExpressions.push(
                                    elementDeclaration
                                )
                            }

                            // 处理属性
                            const attributes = openNode.attributes;
                            if (attributes) {
                                attributes.forEach(attr => {
                                    if (attr.name.name === "className") {
                                        goExpressions.push(
                                            addClass(t, parent ? parent : name_index, attr.value.value)
                                        )
                                    }
                                    else if (attr.name.name === "onClick") {
                                        if (t.isIdentifier(attr.value.expression)) {
                                            goExpressions.push(
                                                addEvent(t, parent ? parent : name_index, attr.name.name, attr.value.expression.name)
                                            )
                                        }
                                        else if (t.isArrowFunctionExpression(attr.value.expression)) {
                                            const params = attr.value.expression.params
                                            const body = attr.value.expression.body
                                            const funcExpr = t.arrowFunctionExpression(
                                                params,
                                                body,
                                                false
                                            )
                                            goExpressions.push(
                                                addEvent(t, parent ? parent : name_index, attr.name.name, funcExpr)
                                            )
                                        }
                                    }
                                    else if (attr.name.name === "style") {
                                        const styleProperties = attr.value.expression;
                                        const getStyleValue = () => {
                                            if (t.isObjectExpression(styleProperties)) {
                                                return t.objectExpression(styleProperties.properties)
                                            } else if (t.isIdentifier(styleProperties)) {
                                                return t.identifier(styleProperties.name)
                                            }
                                        }
                                        const styleAssignment = t.expressionStatement(
                                            t.callExpression(
                                                t.memberExpression(
                                                    t.identifier('Object'),
                                                    t.identifier('assign')
                                                ),
                                                [
                                                    t.memberExpression(
                                                        t.identifier(parent ? parent : name_index),
                                                        t.identifier('style')
                                                    ),
                                                    getStyleValue()
                                                ]
                                            )
                                        );
                                        goExpressions.push(
                                            styleAssignment
                                        )
                                    }
                                    else if (attr.name.name === 'v-if') {
                                        const vIfValueExpression = attr.value.expression;
                                        const vIfExpression = t.ifStatement(
                                            t.unaryExpression('!', vIfValueExpression, true),
                                            t.blockStatement([
                                                t.expressionStatement(
                                                    t.assignmentExpression(
                                                        '=',
                                                        t.memberExpression(
                                                            t.identifier(parent ? parent : name_index),
                                                            t.identifier('style.display'),
                                                        ),
                                                        t.identifier('none')
                                                    )
                                                )
                                            ]),
                                            t.blockStatement([
                                            ])
                                        )
                                        goExpressions.push(
                                            vIfExpression
                                        )
                                    }
                                    else {
                                        if (t.isStringLiteral(attr.value)) {
                                            goExpressions.push(
                                                addNormalAttribute(t, parent ? parent : name_index, attr.name.name, attr.value.value)
                                            )
                                        }
                                        if (t.isJSXExpressionContainer(attr.value)) {
                                            const expression = attr.value.expression;
                                            if (t.isIdentifier(expression)) {
                                                goExpressions.push(
                                                    addNormalAttribute_1(t, parent ? parent : name_index, attr.name.name, expression.name)
                                                )
                                            }
                                        }
                                        else {
                                        }
                                    }
                                })
                            }
                            const children = node.children;
                            children.forEach(child => {
                                if (child.type == "JSXText") {
                                    if (child.value.trim()) {
                                        goExpressions.push(
                                            appendText(t, parent ? parent : name_index, child.value)
                                        )
                                    }
                                }
                                else if (t.isJSXElement(child) || t.isJSXText(child)) {
                                    const child_element = "element_" + child.start;
                                    goExpressions.push(
                                        appendElement(t, parent ? parent : name_index, child_element)
                                    )
                                }
                                // 循环创建元素map
                                else if (t.isJSXExpressionContainer(child) && t.isCallExpression(child.expression)) {
                                    const { callee, arguments: args } = child.expression;
                                    const parentElement = name_index
                                    if (t.isMemberExpression(callee) &&
                                        t.isIdentifier(callee.property, { name: 'map' }) &&
                                        args.length === 1 &&
                                        t.isArrowFunctionExpression(args[0])) {
                                        const listVariable = callee.object;
                                        const callback = args[0];
                                        const param = callback.params[0];
                                        const body = callback.body;
                                        let mapRes = []

                                        const itemChildBlock = "element_" + listVariable.start
                                        if (body.body[0].argument) {
                                            mapRes = getOnFunction(body.body[0].argument, itemChildBlock)
                                        }
                                        const forLoop = t.forOfStatement(
                                            t.variableDeclaration('let', [t.variableDeclarator(param)]),
                                            listVariable,
                                            t.blockStatement([
                                                createElement(t, openNode.name.name, itemChildBlock),
                                                ...mapRes,
                                                appendElement(t, parentElement, itemChildBlock),
                                                // data-v
                                            ])
                                        )
                                        goExpressions.push(forLoop);
                                    }
                                }
                                else if (t.isJSXExpressionContainer(child) && t.isLogicalExpression(child.expression)) {
                                    const child_expression = child.expression
                                    // 元素显隐
                                    if ((t.isIdentifier(child_expression.left) || t.isLogicalExpression(child_expression.left)) && t.isJSXElement(child_expression.right)) {
                                        let mapRes = []
                                        const parentElement = name_index
                                        const itemChildBlock = "element_" + child_expression.right.start
                                        mapRes = getOnFunction(child_expression.right, itemChildBlock)
                                        const booExp = t.ifStatement(
                                            child_expression.left,
                                            t.blockStatement([
                                                createElement(t, openNode.name.name, itemChildBlock),
                                                ...mapRes,
                                                appendElement(t, parentElement, itemChildBlock),
                                            ]),
                                            t.blockStatement([

                                            ])
                                        )
                                        goExpressions.push(booExp)
                                    }
                                }
                                else if (t.isJSXExpressionContainer(child) && t.isConditionalExpression(child.expression)) {
                                    const child_expression = child.expression
                                    let mapTrueRes = []
                                    let mapFalseRes = []
                                    let blockTrueStatement = []
                                    let blockFalseStatement = []
                                    const parentElement = name_index
                                    const itemTrueChildBlock = "element_" + child_expression.consequent.start
                                    const itemFalseChildBlock = "element_" + child_expression.alternate.start
                                    mapTrueRes = getOnFunction(child_expression.consequent, itemTrueChildBlock)

                                    blockTrueStatement = [
                                        createElement(t, openNode.name.name, itemTrueChildBlock),
                                        ...mapTrueRes,
                                        appendElement(t, parentElement, itemTrueChildBlock),
                                    ]
                                    if (!(t.isNullLiteral(child_expression.alternate))) {
                                        mapFalseRes = getOnFunction(child_expression.alternate, itemFalseChildBlock)
                                        blockFalseStatement = [
                                            createElement(t, openNode.name.name, itemFalseChildBlock),
                                            ...mapFalseRes,
                                            appendElement(t, parentElement, itemFalseChildBlock),
                                        ]
                                    }
                                    const booExp = t.ifStatement(
                                        child_expression.test,
                                        t.blockStatement(blockTrueStatement),
                                        t.blockStatement(blockFalseStatement)
                                    )
                                    goExpressions.push(booExp)
                                }
                                else if (child.type == "JSXExpressionContainer") {
                                    const child_expression = child.expression
                                    if (t.isMemberExpression) {
                                        const param = child_expression.object
                                        const property = child_expression.property
                                        if (child_expression.object) {
                                            goExpressions.push(
                                                appendVariable(t, parent ? parent : name_index, t.memberExpression(param, property))
                                            )
                                        }
                                    }
                                    const child_expression_name = child.expression.name
                                    // const param=
                                    if (child_expression_name) {
                                        goExpressions.push(
                                            appendElement(t, parent ? parent : name_index, child_expression_name)
                                        )
                                    }
                                }
                                else {
                                    // console.log('child:',child)
                                }
                            })


                        }
                    }
                    return goExpressions
                }

                path.replaceWithMultiple([
                    // elementDeclaration,
                    // innerHTMLAssignment,
                    ...expressions,
                    // onClickExpress,
                    t.returnStatement(t.identifier('element_' + root_element_index))
                ]);
            },

        }
    };
};

