/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { $, Dimension } from '../../../../base/browser/dom.js';
import { DomScrollableElement } from '../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import './media/gettingStarted.css';
import { localize } from '../../../../nls.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpression, IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, WillSaveStateReason } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { IEditorOpenContext, IEditorSerializer } from '../../../common/editor.js';
import './gettingStartedColors.js';
import { GettingStartedInput } from './gettingStartedInput.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IWorkbenchThemeService } from '../../../services/themes/common/workbenchThemeService.js';
import { handleDemo } from './customGettingStarted.js';


export const allWalkthroughsHiddenContext = new RawContextKey<boolean>('allWalkthroughsHidden', false);
export const inWelcomeContext = new RawContextKey<boolean>('inWelcome', false);

export interface IWelcomePageStartEntry {
	id: string;
	title: string;
	description: string;
	command: string;
	order: number;
	icon: { type: 'icon'; icon: ThemeIcon };
	when: ContextKeyExpression;
}





const REDUCED_MOTION_KEY = 'workbench.welcomePage.preferReducedMotion';
export class GettingStartedPage extends EditorPane {

	public static readonly ID = 'gettingStartedPage';

	private editorInput!: GettingStartedInput;

	private readonly dispatchListeners: DisposableStore = new DisposableStore();
	private readonly mediaDisposables: DisposableStore = new DisposableStore();

	// Ensure that the these are initialized before use.
	// Currently initialized before use in buildCategoriesSlide and scrollToCategory


	private detailsPageScrollbar: DomScrollableElement | undefined;

	private detailsScrollbar: DomScrollableElement | undefined;


	private container: HTMLElement;

	private contextService: IContextKeyService;



	private layoutMarkdown: (() => void) | undefined;



	constructor(
		group: IEditorGroup,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IWorkbenchThemeService protected override readonly themeService: IWorkbenchThemeService,
		@IStorageService private storageService: IStorageService,
		@IEditorGroupsService private readonly groupsService: IEditorGroupsService,
		@IContextKeyService contextService: IContextKeyService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@IAccessibilityService private readonly accessibilityService: IAccessibilityService
	) {

		super(GettingStartedPage.ID, group, telemetryService, themeService, storageService);

		this.container = $('.gettingStartedContainer',
			{
				role: 'document',
				tabindex: 0,
				'aria-label': localize('welcomeAriaLabel', "Overview of how to get up to speed with your editor.")
			});
		// NOTE:创建元素
		const demoElement = handleDemo();
		this.container.appendChild(demoElement);

		this.contextService = this._register(contextService.createScoped(this.container));
		inWelcomeContext.bindTo(this.contextService).set(true);


		this._register(this.dispatchListeners);




		this._register(this.storageService.onWillSaveState((e) => {
			if (e.reason !== WillSaveStateReason.SHUTDOWN) {
				return;
			}

			if (this.workspaceContextService.getWorkspace().folders.length !== 0) {
				return;
			}


			const editorPane = this.groupsService.activeGroup.activeEditorPane;
			if (!(editorPane instanceof GettingStartedPage)) {
				return;
			}

			// Save the state of the walkthrough so we can restore it on reload

		}));
	}

	// remove when 'workbench.welcomePage.preferReducedMotion' deprecated
	private shouldAnimate() {
		if (this.configurationService.getValue(REDUCED_MOTION_KEY)) {
			return false;
		}
		if (this.accessibilityService.isMotionReduced()) {
			return false;
		}
		return true;
	}



	override async setInput(newInput: GettingStartedInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken) {
		this.container.classList.remove('animatable');
		this.editorInput = newInput;
		await super.setInput(newInput, options, context, token);
		if (this.shouldAnimate()) {
			setTimeout(() => this.container.classList.add('animatable'), 0);
		}
	}


	private currentMediaType: string | undefined = undefined;

	protected createEditor(parent: HTMLElement) {
		if (this.detailsPageScrollbar) { this.detailsPageScrollbar.dispose(); }

		parent.appendChild(this.container);
	}



	layout(size: Dimension) {
		this.detailsScrollbar?.scanDomNode();

		this.detailsPageScrollbar?.scanDomNode();


		if (this.editorInput?.selectedStep && this.currentMediaType) {
			this.mediaDisposables.clear();
		}

		this.layoutMarkdown?.();

		this.container.classList.toggle('height-constrained', size.height <= 600);
		this.container.classList.toggle('width-constrained', size.width <= 400);
		this.container.classList.toggle('width-semi-constrained', size.width <= 950);

		this.detailsPageScrollbar?.scanDomNode();
		this.detailsScrollbar?.scanDomNode();
	}
	override clearInput() {
		super.clearInput();
	}


	private runSkip() {
		this.commandService.executeCommand('workbench.action.closeActiveEditor');
	}

	escape() {

		this.runSkip();

	}



	override focus() {
		super.focus();

		const active = this.container.ownerDocument.activeElement;

		let parent = this.container.parentElement;
		while (parent && parent !== active) {
			parent = parent.parentElement;
		}

		if (parent) {
			// Only set focus if there is no other focued element outside this chain.
			// This prevents us from stealing back focus from other focused elements such as quick pick due to delayed load.
			this.container.focus();
		}
	}
}

export class GettingStartedInputSerializer implements IEditorSerializer {
	public canSerialize(editorInput: GettingStartedInput): boolean {
		return true;
	}

	public serialize(editorInput: GettingStartedInput): string {
		// return JSON.stringify({ selectedCategory: editorInput.selectedCategory, selectedStep: editorInput.selectedStep });
		return ''
	}

	public deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): GettingStartedInput {
		return instantiationService.invokeFunction(accessor => {
			return new GettingStartedInput({});
		});
	}
}
