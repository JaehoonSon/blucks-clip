import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface ApiResponse {
  user: User;
  token: string;
}

const LoginButton = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from context

  const responseMessage = (response: CredentialResponse) => {
    if (!response.credential) return;

    axios
      .post<ApiResponse>(`${API_BASE_URL}/api/google-login`, {
        credential: response.credential,
      })
      .then((res) => {
        login(res.data.user, res.data.token);

        navigate("/");
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  };

  const errorMessage = () => {
    console.log("Login Failed:");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={responseMessage}
          onError={errorMessage}
          useOneTap
          shape="rectangular"
          theme="outline"
          size="large"
          text="signin_with"
          width="300"
          logo_alignment="left"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginButton;
