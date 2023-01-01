import { createContext, createElement, ComponentChildren } from 'preact';
import { Store } from 'craq';

const context = createContext<Store<any, any>>(null);

export const CraqReactReduxProvider = ({
  children,
  store,
}: {
  store: Store<any, any>;
  children: ComponentChildren;
}) => createElement(context.Provider, { value: store, children });

export default context;
