/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AccessibleViewType, AccessibleContentProvider, ExtensionContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplementation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { GettingStartedPage, inWelcomeContext } from './gettingStarted.js';
import { IWalkthroughsService } from './gettingStartedService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { GettingStartedInput } from './gettingStartedInput.js';


export class GettingStartedAccessibleView implements IAccessibleViewImplementation {
	readonly type = AccessibleViewType.View;
	readonly priority = 110;
	readonly name = 'walkthroughs';
	readonly when = inWelcomeContext;

	getProvider = (accessor: ServicesAccessor): AccessibleContentProvider | ExtensionContentProvider | undefined => {
		const editorService = accessor.get(IEditorService);
		const editorPane = editorService.activeEditorPane;
		if (!(editorPane instanceof GettingStartedPage)) {
			return;
		}
		const gettingStartedInput = editorPane.input;
		if (!(gettingStartedInput instanceof GettingStartedInput) || !gettingStartedInput.selectedCategory) {
			return;
		}

		const gettingStartedService = accessor.get(IWalkthroughsService);
		const currentWalkthrough = gettingStartedService.getWalkthrough(gettingStartedInput.selectedCategory);
		if (currentWalkthrough) {

			// return new GettingStartedAccessibleProvider(
			// 	accessor.get(IContextKeyService),
			// 	accessor.get(ICommandService),
			// 	accessor.get(IOpenerService),
			// 	editorPane,
			// 	currentWalkthrough,
			// 	currentStepIds);
		}
		return;
	};
}

