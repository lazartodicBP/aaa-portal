import React from 'react';

const LoadingModal: React.FC = () => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Activating subscription...</p>
          <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
