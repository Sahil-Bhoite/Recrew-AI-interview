import React from 'react';

const ThankYouPage = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Thank You for Taking the Test!</h1>
        <p className="mt-4">We will reach out to you if needed in the future.</p>
        <p className="mt-2">You may now close this tab.</p>
      </div>
    </div>
  );
};

export default ThankYouPage;
