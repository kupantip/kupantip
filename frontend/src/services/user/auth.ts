export interface LoginPayload {
  email?: string
  password?: string
}

export interface LoginResponse {
    user_id?: string,
    role?: string,
    email?: string,
    display_name?: string,
    token: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const BACKEND_URL = process.env.BACKEND_URL
  const res = await fetch(`${BACKEND_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  console.log(res);

  if (!res.ok) {
    throw new Error('Login failed')
  }

  return res.json()
}
