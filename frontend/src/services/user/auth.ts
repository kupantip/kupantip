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
  const res = await fetch('http://localhost:8000/api/v1/user/login', {
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
