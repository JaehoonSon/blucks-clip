import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import axios from "axios";
import { API_BASE_URL } from "../config";

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
  const responseMessage = (response: CredentialResponse) => {
    if (!response.credential) return;

    axios
      .post<ApiResponse>(`${API_BASE_URL}/api/google-login`, {
        credential: response.credential,
      })
      .then((res) => {
        const userData: User = res.data.user;
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", res.data.token);
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
