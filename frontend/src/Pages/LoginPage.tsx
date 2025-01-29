import LoginButton from "../Components/LoginButton";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-2xl space-y-8 transform transition-all hover:scale-105 hover:shadow-3xl">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">Blucks Clip</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to unlock the full experience
          </p>
        </div>
        <div className="flex justify-center">
          <LoginButton aria-label="Sign in with your account" />
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
