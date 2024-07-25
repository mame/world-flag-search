import React, { FC, useContext } from 'react';
import AppContext from './AppContext';
import { Alert, Button, ProgressBar } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';

interface Props {
  className: string;
  children: React.ReactNode;
}

const Loading: FC<Props> = ({ className, children }) => {
  const { state } = useContext(AppContext);
  const nodeRef = React.useRef(null);

  return (
    <CSSTransition
      in={state.type == 'running'}
      timeout={100}
      classNames={className}
      nodeRef={nodeRef}
    >
      <div ref={nodeRef} className={className}>
        <div className="loading">
          {state.type != 'failed' ? (
            <ProgressBar
              animated
              striped
              variant="success"
              now={state.type == 'loading' ? state.progress : 100}
            />
          ) : (
            <Alert variant="danger">
              <Alert.Heading>Loading Error</Alert.Heading>
              <p>Failed to load the resources.</p>
              <p>Please try again later.</p>
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
              >
                Reload now
              </Button>
            </Alert>
          )}
        </div>
        {children}
      </div>
    </CSSTransition>
  );
};

export default Loading;
