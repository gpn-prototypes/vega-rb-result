import React, { ErrorInfo, ReactNode } from 'react';
import { cnMixCard } from '@consta/uikit/MixCard';
import { Text } from '@consta/uikit/Text';

interface ErrorBoundaryProps {
  hasError: boolean;
}

export class ErrorBoundary<T> extends React.Component<T, ErrorBoundaryProps> {
  constructor(props: T) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error(errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Text
          view="alert"
          className={cnMixCard({
            verticalSpace: 'm',
            horizontalSpace: 'm',
            shadow: false,
          })}
        >
          Что-то пошло не так. Попробуйте перезагрузить страницу, приносим свои
          извинения.
        </Text>
      );
    }

    return this.props.children;
  }
}
