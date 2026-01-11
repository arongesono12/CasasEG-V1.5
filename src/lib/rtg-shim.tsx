import React, { useState, useEffect, useRef } from 'react';

interface CSSTransitionProps {
  in?: boolean;
  timeout?: number;
  classNames?: string;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  children: React.ReactElement;
}

export const CSSTransition: React.FC<CSSTransitionProps> = ({ in: inProp = false, timeout = 300, classNames = '', mountOnEnter = false, unmountOnExit = false, children }) => {
  const [status, setStatus] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(() => (inProp ? 'entered' : (mountOnEnter || unmountOnExit) ? 'exited' : 'entered'));
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef<boolean>(!mountOnEnter);

  useEffect(() => {
    let enterTimer: any;
    let exitTimer: any;

    if (inProp) {
      if (mountedRef.current === false) {
        mountedRef.current = true;
        setStatus('entering');
        // allow classes to apply on next frame
        requestAnimationFrame(() => {
          enterTimer = setTimeout(() => setStatus('entered'), timeout);
        });
      } else {
        setStatus('entering');
        enterTimer = setTimeout(() => setStatus('entered'), timeout);
      }
    } else {
      if (status !== 'exited') {
        setStatus('exiting');
        exitTimer = setTimeout(() => {
          setStatus('exited');
          if (unmountOnExit) mountedRef.current = false;
        }, timeout);
      }
    }

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProp]);

  if (!mountedRef.current && mountOnEnter) return null;
  if (unmountOnExit && status === 'exited') return null;

  const appliedClass = (() => {
    if (status === 'entering') return `${classNames}-enter ${classNames}-enter-active`;
    if (status === 'entered') return `${classNames}-enter-active`;
    if (status === 'exiting') return `${classNames}-exit ${classNames}-exit-active`;
    return '';
  })();
  return (
    <div ref={nodeRef} className={appliedClass}>
      {children}
    </div>
  );
};

interface TransitionGroupProps {
  component?: any;
  children?: React.ReactNode;
}

export const TransitionGroup: React.FC<TransitionGroupProps> = ({ component = 'div', children }) => {
  if (component === null) {
    return <>{children}</>;
  }
  const Comp: any = component;
  return <Comp>{children}</Comp>;
};
