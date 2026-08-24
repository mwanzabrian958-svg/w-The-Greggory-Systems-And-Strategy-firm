import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-rose-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight mb-2">Something went wrong</h2>
            <p className="text-[8px] text-slate-400 uppercase tracking-widest mb-4">
              {this.state.error?.message || 'Unexpected error in portal'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all"
            >
              Recover
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
