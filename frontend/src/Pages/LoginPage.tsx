import LoginButton from "../Components/LoginButton";

const LoginPage = () => {
  return (
    // Outer container: light gray background for subtle contrast
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Card container: white background, rounded corners, subtle shadow */}
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-8">
        {/* Header / Branding */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Welcome to <span className="text-blue-600">Blucks Clip</span>
          </h1>
          <p className="text-gray-600">Sign in to unlock the full experience</p>
        </div>

        {/* Sign-In Button */}
        <div className="flex justify-center">
          <LoginButton aria-label="Sign in with Google" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
