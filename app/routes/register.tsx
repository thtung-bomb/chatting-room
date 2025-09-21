import React from 'react'
import AuthForm from '~/components/auth'
import RegisterPage from '~/components/auth/register'
import { Card } from '~/components/ui/card'

function Register() {
	return (
		<AuthForm>
			<RegisterPage />
		</AuthForm>
	)
}

export default Register
