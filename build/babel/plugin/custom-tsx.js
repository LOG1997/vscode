/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

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

				const expressions = []
				getOnFunction(path.node);
				// 处理 JSX 元素的属性
				function getOnFunction(node) {
					// 递归打印name和value
					if (node.children) {
						// getOnFunction(node.children)
						node.children.forEach(child => {
							getOnFunction(child)
						})
						if (node.type == "JSXElement") {
							const openNode = node.openingElement;
							name_index = "element_" + openNode.start;
							const createElementCall = t.callExpression(
								t.memberExpression(t.identifier("document"), t.identifier("createElement")),
								[t.stringLiteral(openNode.name.name)]
							);

							// 创建 element 变量声明
							const elementDeclaration = t.variableDeclaration("const", [
								t.variableDeclarator(t.identifier(name_index), createElementCall)
							]);
							expressions.push(
								elementDeclaration
							)
							const children = node.children;
							children.forEach(child => {
								if (child.type == "JSXText") {
									if (child.value.trim()) {
										expressions.push(
											t.expressionStatement(
												t.callExpression(
													t.memberExpression(t.identifier(name_index), t.identifier("append")),
													[t.stringLiteral(child.value.trim())]
												)
											)
										)
									}
								}
								else if (child.type == "JSXElement" || child.type == "JSXText") {
									const child_element = "element_" + child.start;
									expressions.push(
										t.expressionStatement(
											t.callExpression(
												t.memberExpression(t.identifier(name_index), t.identifier("append")),
												[t.identifier(child_element)]
											)
										)
									)
								}

							})
							const attributes = openNode.attributes;
							if (attributes) {
								attributes.forEach(attr => {

									console.log("attr ", attr.name);

									if (attr.name.name === "className") {
										expressions.push(
											// setAttribute
											t.expressionStatement(
												t.callExpression(
													t.memberExpression(t.identifier(name_index), t.identifier("setAttribute")),
													[t.stringLiteral("class"), t.stringLiteral(attr.value.value)]
												)
											),
										)
									}
									else if (attr.name.name === "onClick") {

										expressions.push(
											t.expressionStatement(
												// 绑定onClick事件
												t.assignmentExpression(
													"=",
													t.memberExpression(t.identifier(name_index), t.identifier(attr.name.name.toLowerCase())),
													t.identifier(attr.value.expression.name)
												)
											)
										)
									}
								})
							}

						}
					}

				}
				path.replaceWithMultiple([
					...expressions,
					t.returnStatement(t.identifier(name_index))
				]);
			}
		}
	};
};

