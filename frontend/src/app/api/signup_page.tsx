const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_HOST

interface SignupData {
    email: string;
    handle: string;
    display_name: string;
    password: string;
}

export async function signupUser(data: SignupData) {
  try {
    const res = await fetch(`${API_BASE_URL}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseText = await res.text();
    if (!res.ok) {
      throw new Error(`Sign up failed: ${responseText}`);
    }

    return JSON.parse(responseText);
  } catch (err) {
    console.error("Signup API Error:", err);
    throw err;
  }
}
