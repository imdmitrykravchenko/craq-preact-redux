import { createElement, ComponentType } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { ComponentContext, Store } from 'craq';
import { context } from 'craq-preact-renderer';
import shallowequal from 'shallowequal';

import craqReactReduxContext from './context';

type Selector<S, T> = (state: S) => T;

const connect =
  <S, T, P>(
    mapStateToProps?: Selector<S, T> | null,
    mapContextToProps?: (context: ComponentContext<S>) => P,
  ) =>
  <A extends T & P>(Wrapped: ComponentType<A>) =>
  (ownProps: Omit<A, keyof T | keyof P>) =>
    createElement(context.Consumer, {
      children: (componentContext) => {
        const contextRef = useRef<P>();
        const contextMountRef = useRef(false);

        if (!contextMountRef.current && mapContextToProps) {
          contextMountRef.current = true;
          contextRef.current = mapContextToProps
            ? mapContextToProps(componentContext)
            : undefined;
        }

        return createElement(craqReactReduxContext.Consumer, {
          children: (store: Store<S, any>) => {
            const stateRef = useRef<T>();
            const mountRef = useRef(false);
            const [selectedProps, setSelectedProps] = useState<T>();
            let selectedPropsValue = selectedProps;

            if (!mountRef.current) {
              selectedPropsValue = mapStateToProps
                ? mapStateToProps(store.getState())
                : undefined;
            }

            useEffect(() => {
              mountRef.current = true;
              stateRef.current = mapStateToProps
                ? mapStateToProps(store.getState())
                : undefined;

              return store.subscribe(() => {
                const nextState = mapStateToProps
                  ? mapStateToProps(store.getState())
                  : undefined;

                if (!shallowequal(stateRef.current, nextState)) {
                  stateRef.current = nextState;
                  setSelectedProps(nextState);
                }
              });
            }, []);

            // @ts-ignore
            return createElement(Wrapped, {
              ...ownProps,
              ...selectedPropsValue,
              ...contextRef.current,
            });
          },
        });
      },
    });

export default connect;
