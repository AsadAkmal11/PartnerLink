import { Component } from 'react';

/** Keeps the rest of the app alive if a visual widget throws. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('PartnerLink UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="mx-auto max-w-lg px-5 py-10 text-center text-sm text-text-muted">
            This section failed to load. Refresh the page to try again.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
