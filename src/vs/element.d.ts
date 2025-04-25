import { ReactElement } from 'react';
// export { };

declare global {
	interface HTMLElement {
		appendChild<T extends (Node | ReactElement)>(node: T): T;
	}
}
